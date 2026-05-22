import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { CAMPAIGN_PARSER_PROMPT } from './prompts/campaign-parser.prompt';
import type { RawBankCampaign } from './connectors';

/**
 * AI-powered campaign text parser.
 *
 * Takes raw, unstructured Turkish bank marketing text and uses Gemini
 * structured output to extract normalized campaign fields.
 *
 * The AI is used ONLY for text extraction — it must not invent or
 * estimate financial values. All numeric reward calculations happen
 * downstream in the deterministic CardScoringService.
 */

export interface ParsedCampaign {
  title: string;
  category: string;
  rewardType: 'CASHBACK' | 'POINTS' | 'MILES' | 'DISCOUNT';
  rewardPercent: number;
  rewardCurrency: string | null;
  network: string | null;
  cardType: 'CREDIT' | 'DEBIT' | null;
  channels: string[];
  minAmount: number | null;
  maxReward: number | null;
  startsAt: string | null;
  endsAt: string | null;
  merchants: string[];
  confidence: number;
}

@Injectable()
export class CampaignParserService {
  private readonly logger = new Logger(CampaignParserService.name);

  constructor(private readonly ai: AiService) {}

  /**
   * Parse a raw bank campaign into structured data using AI.
   *
   * Falls back to a heuristic parse if AI fails, to ensure the pipeline
   * never blocks on a transient AI error.
   */
  async parse(raw: RawBankCampaign): Promise<ParsedCampaign> {
    try {
      const parsed = await this.ai.generateJson<ParsedCampaign>(
        CAMPAIGN_PARSER_PROMPT.system,
        CAMPAIGN_PARSER_PROMPT.buildUserPrompt(raw.rawText, raw.bankName, raw.title),
      );

      this.logger.debug(
        `Parsed campaign: "${parsed.title}" → ${parsed.category} / ${parsed.rewardType} / ${parsed.rewardPercent}%`,
      );

      return this.sanitize(parsed, raw);
    } catch (error) {
      this.logger.warn(
        `AI parsing failed for "${raw.title ?? 'unknown'}": ${error instanceof Error ? error.message : String(error)}`,
      );
      return this.fallbackParse(raw);
    }
  }

  /**
   * Batch parse multiple raw campaigns. Processes sequentially to respect
   * API rate limits.
   */
  async parseBatch(raws: RawBankCampaign[]): Promise<ParsedCampaign[]> {
    const results: ParsedCampaign[] = [];

    for (const raw of raws) {
      const parsed = await this.parse(raw);
      results.push(parsed);

      // Small delay between AI calls to respect rate limits
      await new Promise((r) => setTimeout(r, 200));
    }

    return results;
  }

  /**
   * Ensure parsed values are within valid ranges and have correct types.
   */
  private sanitize(parsed: ParsedCampaign, raw: RawBankCampaign): ParsedCampaign {
    return {
      ...parsed,
      title: parsed.title || raw.title || 'Untitled Campaign',
      rewardPercent: Math.max(0, Math.min(100, Number(parsed.rewardPercent) || 0)),
      minAmount: parsed.minAmount != null ? Math.max(0, Number(parsed.minAmount)) : null,
      maxReward: parsed.maxReward != null ? Math.max(0, Number(parsed.maxReward)) : null,
      channels: Array.isArray(parsed.channels) ? parsed.channels : ['online', 'offline'],
      merchants: Array.isArray(parsed.merchants) ? parsed.merchants : [],
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0)),
    };
  }

  /**
   * Heuristic fallback when AI parsing fails.
   * Extracts what we can from the raw text using regex patterns.
   */
  private fallbackParse(raw: RawBankCampaign): ParsedCampaign {
    const text = raw.rawText.toLowerCase();

    // Extract reward percentage
    const pctMatch = text.match(/%(\d+(?:\.\d+)?)/);
    const rewardPercent = pctMatch ? parseFloat(pctMatch[1]) : 0;

    // Detect reward type
    let rewardType: ParsedCampaign['rewardType'] = 'CASHBACK';
    let rewardCurrency: string | null = 'TL';
    if (text.includes('maxipuan')) { rewardType = 'POINTS'; rewardCurrency = 'MaxiPuan'; }
    else if (text.includes('worldpuan')) { rewardType = 'POINTS'; rewardCurrency = 'Worldpuan'; }
    else if (text.includes('chip-para') || text.includes('chippara')) { rewardType = 'POINTS'; rewardCurrency = 'chip-para'; }
    else if (text.includes('bonus puan')) { rewardType = 'POINTS'; rewardCurrency = 'bonus'; }
    else if (text.includes('mil')) { rewardType = 'MILES'; rewardCurrency = 'mil'; }
    else if (text.includes('indirim')) { rewardType = 'DISCOUNT'; rewardCurrency = 'TL'; }
    else if (text.includes('nakit iade') || text.includes('cashback')) { rewardType = 'CASHBACK'; rewardCurrency = 'TL'; }

    // Detect category
    let category = 'other';
    if (text.includes('market') || text.includes('migros') || text.includes('carrefour')) category = 'grocery';
    else if (text.includes('restoran') || text.includes('yemek') || text.includes('kafe')) category = 'restaurant';
    else if (text.includes('kahve') || text.includes('starbucks')) category = 'coffee';
    else if (text.includes('elektronik') || text.includes('teknosa') || text.includes('mediamarkt')) category = 'electronics';
    else if (text.includes('akaryakıt') || text.includes('yakıt') || text.includes('shell')) category = 'fuel';
    else if (text.includes('seyahat') || text.includes('havayolu') || text.includes('otel')) category = 'travel';
    else if (text.includes('giyim') || text.includes('zara') || text.includes('h&m')) category = 'clothing';
    else if (text.includes('online alışveriş') || text.includes('e-ticaret')) category = 'shopping';

    // Detect network
    let network: string | null = null;
    if (text.includes('mastercard')) network = 'Mastercard';
    else if (text.includes('visa')) network = 'Visa';
    else if (text.includes('troy')) network = 'Troy';

    // Extract max reward
    const maxMatch = text.match(/maksimum\s+(\d+)/);
    const maxReward = maxMatch ? parseFloat(maxMatch[1]) : null;

    this.logger.debug(
      `Fallback parsed: "${raw.title ?? 'unknown'}" → ${category} / ${rewardType} / ${rewardPercent}%`,
    );

    return {
      title: raw.title || 'Untitled Campaign',
      category,
      rewardType,
      rewardPercent,
      rewardCurrency,
      network,
      cardType: 'CREDIT',
      channels: ['online', 'offline'],
      minAmount: null,
      maxReward,
      startsAt: null,
      endsAt: null,
      merchants: [],
      confidence: 0.5,
    };
  }
}
