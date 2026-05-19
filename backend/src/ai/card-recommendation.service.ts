import { Injectable, Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { CampaignsService } from '../campaigns/campaigns.service';
import { SavedCardsService } from '../saved-cards/saved-cards.service';
import { CARD_RECOMMENDATION_PROMPT } from './prompts';

/**
 * AI Card Recommendation Engine.
 *
 * Given a merchant context + amount, evaluates the user's cards against
 * active campaigns and produces an AI-powered recommendation with
 * human-readable reasoning.
 */
@Injectable()
export class CardRecommendationService {
  private readonly logger = new Logger(CardRecommendationService.name);

  constructor(
    private readonly ai: AiService,
    private readonly campaigns: CampaignsService,
    private readonly savedCards: SavedCardsService,
  ) {}

  /**
   * Generate an AI-powered card recommendation.
   *
   * @param userId - The user whose cards to evaluate
   * @param merchantName - Merchant being paid
   * @param merchantCategory - AI-determined category
   * @param amount - Transaction amount
   * @param currency - Currency code (default: TRY)
   */
  async recommend(
    userId: string,
    merchantName: string,
    merchantCategory: string,
    amount: number,
    currency = 'TRY',
  ) {
    // 1. Get user's saved cards
    const userCards = await this.savedCards.findAllByUser(userId);
    if (userCards.length === 0) {
      return {
        recommendedCardId: null,
        recommendedBank: 'N/A',
        reason: 'No saved cards found. Please add your cards to receive AI-powered recommendations.',
        estimatedBenefit: 'N/A',
        confidence: 0,
      };
    }

    // 2. Get matching bank names from user's cards
    const bankNames = [...new Set(userCards.map((c) => c.bankName))];

    // 3. Fetch active campaigns for the merchant category
    const activeCampaigns = await this.campaigns.findByCategory(merchantCategory, bankNames);

    // 4. Build AI context
    const cardContext = userCards.map((c) => ({
      id: c.id,
      bankName: c.bankName,
      cardType: c.cardType,
      last4: c.last4,
      cardAlias: c.cardAlias ?? undefined,
      rewardType: c.rewardType,
    }));

    const campaignContext = activeCampaigns.map((c) => ({
      title: c.title,
      bankName: c.bankName,
      category: c.category,
      rewardType: c.rewardType,
      rewardRate: Number(c.rewardRate),
      maxReward: c.maxReward ? Number(c.maxReward) : undefined,
      installmentCount: c.installmentCount ?? undefined,
      description: c.description,
    }));

    // 5. Query AI for recommendation
    this.logger.log(`Generating card recommendation for ${merchantName} (${merchantCategory}), amount: ${amount} ${currency}`);

    const aiResult = await this.ai.generateJson<{
      recommendedCardId: string;
      recommendedBank: string;
      reason: string;
      estimatedBenefit: string;
      confidence: number;
      rewardBreakdown?: {
        type: string;
        value: number;
        unit: string;
      };
    }>(
      CARD_RECOMMENDATION_PROMPT.system,
      CARD_RECOMMENDATION_PROMPT.buildUserPrompt({
        merchantName,
        merchantCategory,
        amount,
        currency,
        userCards: cardContext,
        activeCampaigns: campaignContext,
      }),
    );

    // 6. Validate recommended card exists in user's cards
    const recommendedCard = userCards.find((c) => c.id === aiResult.recommendedCardId);
    if (!recommendedCard && userCards.length > 0) {
      // AI returned an invalid card ID — fallback to first card with matching bank
      const fallback = userCards.find((c) => c.bankName === aiResult.recommendedBank) ?? userCards[0];
      aiResult.recommendedCardId = fallback.id;
      aiResult.recommendedBank = fallback.bankName;
    }

    return aiResult;
  }
}
