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
        resolvedBy: string;
    }>;
    recommendCard(user: JwtPayload, dto: RecommendCardDto): Promise<import("./card-recommendation.service").AiRecommendationResult>;
}
export {};
