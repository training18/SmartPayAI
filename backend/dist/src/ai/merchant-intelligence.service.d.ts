import { AiService } from './ai.service';
import { MerchantsService } from '../merchants/merchants.service';
export declare class MerchantIntelligenceService {
    private readonly ai;
    private readonly merchants;
    private readonly logger;
    constructor(ai: AiService, merchants: MerchantsService);
    analyze(merchantName: string, mcc?: string): Promise<{
        merchantCategory: string;
        spendingType: string;
        confidence: number;
        reasoning: string;
        merchantId: string;
    }>;
}
