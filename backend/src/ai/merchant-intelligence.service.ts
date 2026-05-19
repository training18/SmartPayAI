import { Injectable, Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { MerchantsService } from '../merchants/merchants.service';
import { MERCHANT_ANALYSIS_PROMPT } from './prompts';

/**
 * AI Merchant Intelligence Engine.
 *
 * Analyzes merchant names to determine category and spending type.
 * Caches results in the merchants table to avoid re-analyzing known merchants.
 */
@Injectable()
export class MerchantIntelligenceService {
  private readonly logger = new Logger(MerchantIntelligenceService.name);

  constructor(
    private readonly ai: AiService,
    private readonly merchants: MerchantsService,
  ) {}

  /**
   * Analyze a merchant — returns cached result if available, otherwise queries AI.
   */
  async analyze(merchantName: string, mcc?: string) {
    // 1. Check cache first
    const cached = await this.merchants.findByName(merchantName);
    if (cached) {
      this.logger.debug(`Merchant cache hit: ${merchantName} → ${cached.category}`);
      return {
        merchantCategory: cached.category,
        spendingType: cached.spendingType ?? 'discretionary',
        confidence: 0.95,
        reasoning: `Previously analyzed: ${merchantName} is categorized as ${cached.category}`,
        merchantId: cached.id,
      };
    }

    // 2. Query AI
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

    // 3. Cache result
    const merchant = await this.merchants.upsert({
      name: merchantName,
      category: aiResult.merchantCategory,
      mcc,
      spendingType: aiResult.spendingType,
      aiMetadata: aiResult as unknown as Record<string, unknown>,
    });

    return {
      ...aiResult,
      merchantId: merchant.id,
    };
  }
}
