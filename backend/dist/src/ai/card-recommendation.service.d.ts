import { AiService } from './ai.service';
import { CampaignsService } from '../campaigns/campaigns.service';
import { SavedCardsService } from '../saved-cards/saved-cards.service';
export declare class CardRecommendationService {
    private readonly ai;
    private readonly campaigns;
    private readonly savedCards;
    private readonly logger;
    constructor(ai: AiService, campaigns: CampaignsService, savedCards: SavedCardsService);
    recommend(userId: string, merchantName: string, merchantCategory: string, amount: number, currency?: string): Promise<{
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
    } | {
        recommendedCardId: null;
        recommendedBank: string;
        reason: string;
        estimatedBenefit: string;
        confidence: number;
    }>;
}
