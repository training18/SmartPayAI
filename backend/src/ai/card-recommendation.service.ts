import { Injectable, Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { CampaignCacheService } from '../campaign-service/campaign-cache.service';
import { SavedCardsService } from '../saved-cards/saved-cards.service';
import { CardScoringService } from './card-scoring.service';
import { RoutingSimulationService, RoutingPlan } from './routing-simulation.service';
import { SavingsService, SavingsBreakdownResult } from '../savings/savings.service';
import { CARD_RECOMMENDATION_PROMPT } from './prompts';
import type { ScoredCandidatePromptInput } from './prompts/card-recommendation.prompt';

/**
 * AI Card Recommendation orchestrator.
 *
 * Pipeline:
 *   user cards + live campaigns (from cache/DB)
 *        │
 *        ▼  CardScoringService          (deterministic — campaign matching, math)
 *   scored candidates
 *        │
 *        ▼  AiService                   (LLM reasoning — picks winner, writes reason)
 *   raw AI decision
 *        │
 *        ▼  RoutingSimulationService    (simulated routing — selected/rejected, savings)
 *   structured Recommendation payload
 *
 * KEY CHANGE: Campaigns now come from CampaignCacheService (Redis + DB)
 * instead of the old static CampaignsService.findByCategory().
 */
@Injectable()
export class CardRecommendationService {
  private readonly logger = new Logger(CardRecommendationService.name);

  constructor(
    private readonly ai: AiService,
    private readonly campaignCache: CampaignCacheService,
    private readonly savedCards: SavedCardsService,
    private readonly scoring: CardScoringService,
    private readonly routing: RoutingSimulationService,
    private readonly savings: SavingsService,
  ) { }

  async recommend(
    userId: string,
    merchantName: string,
    merchantCategory: string,
    amount: number,
    currency = 'TRY',
  ): Promise<AiRecommendationResult> {
    // 1. Load user cards
    const userCards = await this.savedCards.findAllByUser(userId);
    if (userCards.length === 0) {
      return this.emptyRecommendation();
    }

    // 2. Fetch live campaigns from cache (Redis → DB fallback)
    const bankNames = [...new Set(userCards.map((c) => c.bankName))];
    const activeCampaigns = await this.campaignCache.getActiveCampaigns(merchantCategory, bankNames);

    this.logger.log(
      `[Recommend] ${merchantName} (${merchantCategory}) — ${userCards.length} cards, ` +
      `${activeCampaigns.length} live campaigns from ${bankNames.join(', ')}`,
    );

    // 3. Deterministic scoring — campaign matching + reward computation
    const scored = this.scoring.scoreCards(userCards, activeCampaigns, amount);

    // 4. AI: pick winner + author reasoning over the structured candidates
    const candidates: ScoredCandidatePromptInput[] = scored.map((s) => ({
      cardId: s.cardId,
      bankName: s.bankName,
      cardType: s.cardType,
      first4: s.first4,
      network: s.network,
      networkLabel: s.networkLabel,
      cardAlias: s.cardAlias,
      rewardType: s.rewardType,
      expectedReward: s.bestMatch
        ? {
          value: s.bestMatch.rewardValue,
          valueTL: s.bestMatch.rewardValueTL,
          unit: s.bestMatch.rewardUnit,
          type: s.bestMatch.rewardType,
          campaignTitle: s.bestMatch.title,
        }
        : null,
      matchedCampaigns: s.matches.map((m) => ({
        title: m.title,
        rewardRate: m.rewardRate,
        rewardValue: m.rewardValue,
        rewardUnit: m.rewardUnit,
      })),
    }));

    const hasAnyActiveCampaign = scored.some((s) => s.bestMatch !== null);
    let aiResult: AiRawDecision;

    if (candidates.length === 1 || !hasAnyActiveCampaign) {
      this.logger.log(
        `[Recommend] Trivial recommendation: Bypassing AI call (candidates: ${candidates.length}, campaigns: ${activeCampaigns.length})`
      );

      const winner = scored[0];
      const rejectedCards = scored
        .slice(1)
        .map((c) => ({
          cardId: c.cardId,
          reason: 'No active campaign found for this category.',
        }));

      aiResult = {
        recommendedCardId: winner.cardId,
        recommendedBank: winner.bankName,
        recommendedNetwork: winner.networkLabel,
        reason: 'No active campaign in this spending category, thus the most suitable card was selected.',
        estimatedBenefit: '0.00 TL',
        confidence: 1.0,
        rewardBreakdown: null,
        rejectedCards,
      };
    } else {
      this.logger.log(
        `Recommending for ${merchantName} (${merchantCategory}) — ${candidates.length} candidates, ` +
        `${activeCampaigns.length} active campaigns`,
      );

      aiResult = await this.ai.generateJson<AiRawDecision>(
        CARD_RECOMMENDATION_PROMPT.system,
        CARD_RECOMMENDATION_PROMPT.buildUserPrompt({
          merchantName,
          merchantCategory,
          amount,
          currency,
          candidates,
        }),
      );
    }

    // 5. Routing simulation — build the structured trace we persist
    const plan = this.routing.buildPlan({
      scored,
      aiSelectedCardId: aiResult.recommendedCardId,
      aiRewardBreakdown: aiResult.rewardBreakdown ?? null,
    });

    const winnerCard = scored.find((s) => s.cardId === plan.selectedCardId) ?? scored[0];
    const savings = winnerCard
      ? this.savings.calculateSavings(amount, winnerCard, scored)
      : {
        cashbackEarned: 0,
        discountAmount: 0,
        pointsValue: 0,
        installmentValue: 0,
        totalSavedAmount: 0,
      };

    // 6. Merge AI-authored per-card rejection lines with the routing plan
    const rejectedWithReasons = plan.rejectedCards.map((r) => {
      const aiReason = aiResult.rejectedCards?.find((x) => x.cardId === r.cardId)?.reason;
      return aiReason ? { ...r, reason: aiReason } : r;
    });

    return {
      recommendedCardId: plan.selectedCardId,
      recommendedBank: plan.selectedBank,
      recommendedNetwork: plan.selectedNetwork,
      reason: aiResult.reason,
      estimatedBenefit: aiResult.estimatedBenefit,
      confidence: aiResult.confidence,
      rewardBreakdown: aiResult.rewardBreakdown ?? null,
      routingPlan: { ...plan, rejectedCards: rejectedWithReasons },
      savings,
      aiRaw: aiResult,
    };
  }

  private emptyRecommendation(): AiRecommendationResult {
    return {
      recommendedCardId: null,
      recommendedBank: 'N/A',
      recommendedNetwork: 'Unknown',
      reason: 'No saved cards found. Please add your cards to receive AI-powered recommendations.',
      estimatedBenefit: 'N/A',
      confidence: 0,
      rewardBreakdown: null,
      routingPlan: null,
      savings: {
        cashbackEarned: 0,
        discountAmount: 0,
        pointsValue: 0,
        installmentValue: 0,
        totalSavedAmount: 0,
      },
      aiRaw: null,
    };
  }
}

interface AiRawDecision {
  recommendedCardId: string | null;
  recommendedBank: string;
  recommendedNetwork?: string;
  reason: string;
  estimatedBenefit: string;
  confidence: number;
  rewardBreakdown?: { type: string; value: number; unit: string } | null;
  rejectedCards?: Array<{ cardId: string; reason: string }>;
}

export interface AiRecommendationResult {
  recommendedCardId: string | null;
  recommendedBank: string;
  recommendedNetwork: string;
  reason: string;
  estimatedBenefit: string;
  confidence: number;
  rewardBreakdown: { type: string; value: number; unit: string } | null;
  routingPlan: RoutingPlan | null;
  savings: SavingsBreakdownResult;
  aiRaw: AiRawDecision | null;
}
