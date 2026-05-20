import { AiService } from './ai.service';
import { CampaignsService } from '../campaigns/campaigns.service';
import { SavedCardsService } from '../saved-cards/saved-cards.service';
import { CardScoringService } from './card-scoring.service';
import { RoutingSimulationService, RoutingPlan } from './routing-simulation.service';
import { SavingsService, SavingsBreakdownResult } from '../savings/savings.service';
export declare class CardRecommendationService {
    private readonly ai;
    private readonly campaigns;
    private readonly savedCards;
    private readonly scoring;
    private readonly routing;
    private readonly savings;
    private readonly logger;
    constructor(ai: AiService, campaigns: CampaignsService, savedCards: SavedCardsService, scoring: CardScoringService, routing: RoutingSimulationService, savings: SavingsService);
    recommend(userId: string, merchantName: string, merchantCategory: string, amount: number, currency?: string): Promise<AiRecommendationResult>;
    private emptyRecommendation;
}
interface AiRawDecision {
    recommendedCardId: string | null;
    recommendedBank: string;
    recommendedNetwork?: string;
    reason: string;
    estimatedBenefit: string;
    confidence: number;
    rewardBreakdown?: {
        type: string;
        value: number;
        unit: string;
    } | null;
    rejectedCards?: Array<{
        cardId: string;
        reason: string;
    }>;
}
export interface AiRecommendationResult {
    recommendedCardId: string | null;
    recommendedBank: string;
    recommendedNetwork: string;
    reason: string;
    estimatedBenefit: string;
    confidence: number;
    rewardBreakdown: {
        type: string;
        value: number;
        unit: string;
    } | null;
    routingPlan: RoutingPlan | null;
    savings: SavingsBreakdownResult;
    aiRaw: AiRawDecision | null;
}
export {};
