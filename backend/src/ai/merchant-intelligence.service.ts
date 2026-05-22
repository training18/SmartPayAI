import { Injectable, Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { MerchantsService } from '../merchants/merchants.service';
import { MccMappingService } from '../merchants/mcc-mapping.service';
import { MERCHANT_ANALYSIS_PROMPT } from './prompts';

/**
 * AI Merchant Intelligence Engine.
 *
 * Analyzes merchant names to determine category and spending type.
 * Resolution priority:
 *   1. DB cache (previously analyzed merchants)
 *   2. MCC code lookup (deterministic, no AI call)
 *   3. AI analysis (Gemini) — result is cached for future lookups
 *
 * Also provides fuzzy matching for merchant name normalization.
 */

/** Known merchant → category overrides for instant matching. */
const MERCHANT_OVERRIDES: Record<string, string> = {
  yemeksepeti: 'restaurant',
  getir: 'restaurant',
  'getir yemek': 'restaurant',
  trendyol: 'shopping',
  hepsiburada: 'shopping',
  amazon: 'shopping',
  n11: 'shopping',
  migros: 'grocery',
  carrefoursa: 'grocery',
  a101: 'grocery',
  bim: 'grocery',
  sok: 'grocery',
  macrocenter: 'grocery',
  starbucks: 'coffee',
  'kahve dünyası': 'coffee',
  'nero cafe': 'coffee',
  mediamarkt: 'electronics',
  teknosa: 'electronics',
  'vatan bilgisayar': 'electronics',
  shell: 'fuel',
  bp: 'fuel',
  opet: 'fuel',
  total: 'fuel',
  petrol: 'fuel',
  pegasus: 'travel',
  thy: 'travel',
  'turkish airlines': 'travel',
  'booking.com': 'travel',
  airbnb: 'travel',
  zara: 'clothing',
  'h&m': 'clothing',
  mango: 'clothing',
  'lc waikiki': 'clothing',
  adidas: 'clothing',
  nike: 'clothing',
  'burger king': 'restaurant',
  mcdonalds: 'restaurant',
  kfc: 'restaurant',
  'dominos pizza': 'restaurant',
};

@Injectable()
export class MerchantIntelligenceService {
  private readonly logger = new Logger(MerchantIntelligenceService.name);

  constructor(
    private readonly ai: AiService,
    private readonly merchants: MerchantsService,
    private readonly mccMapping: MccMappingService,
  ) {}

  /**
   * Analyze a merchant — multi-layer resolution:
   * 1. DB cache → 2. fuzzy override match → 3. MCC lookup → 4. AI analysis
   */
  async analyze(merchantName: string, mcc?: string) {
    // 1. Check DB cache first
    const cached = await this.merchants.findByName(merchantName);
    if (cached) {
      this.logger.debug(`Merchant cache hit: ${merchantName} → ${cached.category}`);
      return {
        merchantCategory: cached.category,
        spendingType: cached.spendingType ?? 'discretionary',
        confidence: 0.95,
        reasoning: `Previously analyzed: ${merchantName} is categorized as ${cached.category}`,
        merchantId: cached.id,
        resolvedBy: 'cache',
      };
    }

    // 2. Try fuzzy merchant name override
    const override = this.fuzzyMatchOverride(merchantName);
    if (override) {
      this.logger.debug(`Merchant fuzzy match: ${merchantName} → ${override}`);
      const merchant = await this.merchants.upsert({
        name: merchantName,
        category: override,
        mcc,
        spendingType: 'discretionary',
        aiMetadata: { resolvedBy: 'fuzzy_override' },
      });
      return {
        merchantCategory: override,
        spendingType: 'discretionary',
        confidence: 0.90,
        reasoning: `Known merchant match: ${merchantName} is categorized as ${override}`,
        merchantId: merchant.id,
        resolvedBy: 'fuzzy_override',
      };
    }

    // 3. Try MCC code lookup (deterministic)
    const mccCategory = this.mccMapping.resolveCategory(mcc);
    if (mccCategory) {
      this.logger.debug(`MCC resolution: ${merchantName} (MCC ${mcc}) → ${mccCategory}`);
      const merchant = await this.merchants.upsert({
        name: merchantName,
        category: mccCategory,
        mcc,
        spendingType: 'discretionary',
        aiMetadata: { resolvedBy: 'mcc_lookup', mcc },
      });
      return {
        merchantCategory: mccCategory,
        spendingType: 'discretionary',
        confidence: 0.85,
        reasoning: `MCC code ${mcc} maps to category ${mccCategory}`,
        merchantId: merchant.id,
        resolvedBy: 'mcc_lookup',
      };
    }

    // 4. Query AI as last resort
    this.logger.log(`Analyzing merchant via AI: ${merchantName}`);
    const aiResult = await this.ai.generateJson<{
      merchantCategory: string;
      spendingType: string;
      confidence: number;
      reasoning: string;
    }>(
      MERCHANT_ANALYSIS_PROMPT.system,
      MERCHANT_ANALYSIS_PROMPT.buildUserPrompt(merchantName, mcc),
    );

    // Cache result
    const merchant = await this.merchants.upsert({
      name: merchantName,
      category: aiResult.merchantCategory,
      mcc,
      spendingType: aiResult.spendingType,
      aiMetadata: { ...aiResult, resolvedBy: 'ai_analysis' } as unknown as Record<string, unknown>,
    });

    return {
      ...aiResult,
      merchantId: merchant.id,
      resolvedBy: 'ai_analysis',
    };
  }

  /**
   * Fuzzy match a merchant name against known overrides.
   * Handles case insensitivity, partial matches, and Turkish character normalization.
   */
  private fuzzyMatchOverride(merchantName: string): string | null {
    const normalized = merchantName.toLowerCase().replace(/[^a-zöçşığü0-9\s&.]/g, '').trim();

    // Exact match
    if (MERCHANT_OVERRIDES[normalized]) {
      return MERCHANT_OVERRIDES[normalized];
    }

    // Check if any override key is contained in the merchant name or vice versa
    for (const [key, category] of Object.entries(MERCHANT_OVERRIDES)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return category;
      }
    }

    return null;
  }
}
