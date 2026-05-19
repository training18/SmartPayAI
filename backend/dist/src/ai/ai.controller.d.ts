import { MerchantIntelligenceService } from './merchant-intelligence.service';
import { CardRecommendationService } from './card-recommendation.service';
import { JwtPayload } from '../common/types';
declare class AnalyzeMerchantDto {
    merchantName: string;
    mcc?: string;
}
declare class RecommendCardDto {
    merchantName: string;
    merchantCategory: string;
    amount: number;
    currency?: string;
}
export declare class AiController {
    private readonly merchantIntel;
    private readonly cardRecommendation;
    constructor(merchantIntel: MerchantIntelligenceService, cardRecommendation: CardRecommendationService);
    analyzeMerchant(dto: AnalyzeMerchantDto): Promise<{
        merchantCategory: string;
        spendingType: string;
        confidence: number;
        reasoning: string;
        merchantId: string;
    }>;
    recommendCard(user: JwtPayload, dto: RecommendCardDto): Promise<{
        recommendedCardId: string;
        recommendedBank: string;
        reason: string;
        estimatedBenefit: string;
        confidence: number;
        rewardBreakdown?: {
            type: string;
            value: number;
            unit: string;
        } | undefined;
    } | {
        recommendedCardId: null;
        recommendedBank: string;
        reason: string;
        estimatedBenefit: string;
        confidence: number;
    }>;
}
export {};
