"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CargoAiOptimizationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CargoAiOptimizationService = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("../../ai/ai.service");
let CargoAiOptimizationService = CargoAiOptimizationService_1 = class CargoAiOptimizationService {
    aiService;
    logger = new common_1.Logger(CargoAiOptimizationService_1.name);
    constructor(aiService) {
        this.aiService = aiService;
    }
    async optimize(input) {
        if (input.quotes.length === 0) {
            return [];
        }
        if (input.merchantPreference && input.merchantPreference.trim().length > 0) {
            try {
                return await this.optimizeWithGemini(input);
            }
            catch (error) {
                this.logger.warn(`Gemini optimization failed, falling back to rule-based weights: ${error instanceof Error ? error.message : String(error)}`);
                return this.optimizeDeterministic(input);
            }
        }
        return this.optimizeDeterministic(input);
    }
    optimizeDeterministic(input) {
        const { quotes, receiverCity } = input;
        const prices = quotes.map((q) => q.price);
        const minPrice = Math.min(...prices);
        const times = quotes.map((q) => q.deliveryDays);
        const minDays = Math.min(...times);
        const scoredQuotes = quotes.map((quote) => {
            const priceScore = quote.price > 0 ? (minPrice / quote.price) * 100 : 0;
            const deliveryScore = quote.deliveryDays > 0 ? (minDays / quote.deliveryDays) * 100 : 0;
            const reliabilityScore = quote.reliabilityScore;
            const regionalScore = this.getSimulatedRegionalScore(quote.providerCode, receiverCity);
            const totalScore = priceScore * 0.50 +
                deliveryScore * 0.25 +
                reliabilityScore * 0.15 +
                regionalScore * 0.10;
            const roundedScore = Math.round(totalScore * 10) / 10;
            return {
                providerCode: quote.providerCode,
                providerName: quote.providerName,
                price: quote.price,
                estimatedDeliveryDays: quote.deliveryDays,
                aiScore: roundedScore,
                rank: 1,
                isRecommended: false,
                explanation: `Recommended based on weighted efficiency scoring (Price: ${Math.round(priceScore)}%, Speed: ${Math.round(deliveryScore)}%, Reliability: ${Math.round(reliabilityScore)}%, Region: ${Math.round(regionalScore)}%).`,
            };
        });
        scoredQuotes.sort((a, b) => b.aiScore - a.aiScore);
        return scoredQuotes.map((q, index) => ({
            ...q,
            rank: index + 1,
            isRecommended: index === 0,
        }));
    }
    async optimizeWithGemini(input) {
        const systemPrompt = `You are the AI Cargo Optimizer for SmartPayAI. Your task is to rank the available cargo options based on the merchant's preference.
You must return a JSON response containing an array of rankings.
Strictly adhere to these rules:
1. Do NOT recalculate or modify the shipping prices. Use the prices provided.
2. Calculate an AI score (0-100) reflecting how well each provider meets the merchant's criteria.
3. Sort the providers from highest AI score to lowest. Set their ranks sequentially (1 being the best match).
4. Provide a brief, professional, and clear 1-2 sentence explanation of why this provider received its score and ranking, in the same language as the merchant's preference (or English if Turkish is not used).

JSON structure:
{
  "rankings": [
    {
      "providerCode": "yurtici",
      "aiScore": 95.5,
      "explanation": "..."
    }
  ]
}`;
        const userPrompt = `Merchant Preference: "${input.merchantPreference}"
Sender Location: ${input.senderCity}
Receiver Location: ${input.receiverCity}
Package: Weight ${input.weight} kg, Volume ${input.desi} Desi

Available Cargo Options:
${input.quotes.map((q) => `- Code: ${q.providerCode}, Name: ${q.providerName}, Price: ${q.price} TRY, Delivery: ${q.deliveryDays} days, Reliability: ${q.reliabilityScore}%, Success Rate: ${q.deliverySuccessRate}%`).join('\n')}
`;
        const aiResponse = await this.aiService.generateJson(systemPrompt, userPrompt);
        const optimizedQuotes = input.quotes.map((quote) => {
            const aiRankInfo = aiResponse.rankings.find((r) => r.providerCode.toLowerCase() === quote.providerCode.toLowerCase());
            const aiScore = aiRankInfo ? aiRankInfo.aiScore : 75.0;
            const explanation = aiRankInfo ? aiRankInfo.explanation : 'Ranked via AI optimization fallback.';
            return {
                providerCode: quote.providerCode,
                providerName: quote.providerName,
                price: quote.price,
                estimatedDeliveryDays: quote.deliveryDays,
                aiScore: Math.round(aiScore * 10) / 10,
                rank: 1,
                isRecommended: false,
                explanation,
            };
        });
        optimizedQuotes.sort((a, b) => b.aiScore - a.aiScore);
        return optimizedQuotes.map((q, index) => ({
            ...q,
            rank: index + 1,
            isRecommended: index === 0,
        }));
    }
    getSimulatedRegionalScore(code, city) {
        const cityLower = city.trim().toLowerCase();
        if (code === 'yurtici') {
            if (['istanbul', 'ankara', 'izmir'].includes(cityLower))
                return 96.0;
            return 90.0;
        }
        if (code === 'aras') {
            if (['bursa', 'kocaeli', 'izmir', 'manisa'].includes(cityLower))
                return 94.0;
            return 88.0;
        }
        if (code === 'mng') {
            if (['konya', 'kayseri', 'gaziantep', 'adana'].includes(cityLower))
                return 92.0;
            return 85.0;
        }
        return 85.0;
    }
};
exports.CargoAiOptimizationService = CargoAiOptimizationService;
exports.CargoAiOptimizationService = CargoAiOptimizationService = CargoAiOptimizationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], CargoAiOptimizationService);
//# sourceMappingURL=cargo-ai-optimization.service.js.map