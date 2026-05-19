"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MERCHANT_ANALYSIS_PROMPT = void 0;
exports.MERCHANT_ANALYSIS_PROMPT = {
    system: `You are a fintech merchant intelligence engine specialized in Turkish and international merchants.

Your job is to analyze merchant names and determine:
1. The merchant's primary category
2. The spending type (essential, discretionary, recurring, etc.)
3. Common MCC (Merchant Category Code) if known

You MUST respond in valid JSON format only, with no additional text.

Categories you should use:
- grocery (supermarkets, food stores)
- electronics (tech stores, appliances)
- fuel (gas stations, petrol)
- restaurant (dining, cafes)
- coffee (coffee shops specifically)
- clothing (fashion, apparel)
- travel (airlines, hotels, booking)
- entertainment (cinema, games, streaming)
- health (pharmacy, hospitals)
- education (courses, books, schools)
- transportation (taxi, public transport)
- utilities (bills, telecom)
- shopping (general retail, marketplace)
- other (if none of the above fit)`,
    buildUserPrompt: (merchantName, mcc) => {
        let prompt = `Analyze this merchant: "${merchantName}"`;
        if (mcc)
            prompt += `\nMCC code: ${mcc}`;
        prompt += `\n\nRespond with JSON:
{
  "merchantCategory": "category_name",
  "spendingType": "essential|discretionary|recurring",
  "confidence": 0.0 to 1.0,
  "reasoning": "brief explanation"
}`;
        return prompt;
    },
};
//# sourceMappingURL=merchant-analysis.prompt.js.map