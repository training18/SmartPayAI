import { AiService } from '../../ai/ai.service';
export interface ProviderMetrics {
    providerCode: string;
    providerName: string;
    price: number;
    deliveryDays: number;
    reliabilityScore: number;
    deliverySuccessRate: number;
}
export interface OptimizationInput {
    quotes: ProviderMetrics[];
    senderCity: string;
    receiverCity: string;
    weight: number;
    desi: number;
    merchantPreference?: string;
}
export interface OptimizedQuote {
    providerCode: string;
    providerName: string;
    price: number;
    estimatedDeliveryDays: number;
    aiScore: number;
    rank: number;
    isRecommended: boolean;
    explanation: string;
}
export declare class CargoAiOptimizationService {
    private readonly aiService;
    private readonly logger;
    constructor(aiService: AiService);
    optimize(input: OptimizationInput): Promise<OptimizedQuote[]>;
    private optimizeDeterministic;
    private optimizeWithGemini;
    private getSimulatedRegionalScore;
}
