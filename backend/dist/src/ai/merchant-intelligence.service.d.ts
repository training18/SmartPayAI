import { AiService } from './ai.service';
import { MerchantsService } from '../merchants/merchants.service';
import { MccMappingService } from '../merchants/mcc-mapping.service';
export declare class MerchantIntelligenceService {
    private readonly ai;
    private readonly merchants;
    private readonly mccMapping;
    private readonly logger;
    constructor(ai: AiService, merchants: MerchantsService, mccMapping: MccMappingService);
    analyze(merchantName: string, mcc?: string): Promise<{
        merchantCategory: string;
        spendingType: string;
        confidence: number;
        reasoning: string;
        merchantId: string;
        resolvedBy: string;
    }>;
    private fuzzyMatchOverride;
}
