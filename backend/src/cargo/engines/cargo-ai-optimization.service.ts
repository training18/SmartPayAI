import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../../ai/ai.service';

export interface ProviderMetrics {
  providerCode: string;
  providerName: string;
  price: number;
  deliveryDays: number;
  reliabilityScore: number;      // 0 to 100
  deliverySuccessRate: number;   // 0 to 100
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
  aiScore: number; // 0-100
  rank: number;
  isRecommended: boolean;
  explanation: string;
}

@Injectable()
export class CargoAiOptimizationService {
  private readonly logger = new Logger(CargoAiOptimizationService.name);

  constructor(private readonly aiService: AiService) {}

  /**
   * Main entrypoint for ranking.
   * Uses Gemini AI if merchant preferences are provided, otherwise falls back to deterministic weighted scoring.
   */
  async optimize(input: OptimizationInput): Promise<OptimizedQuote[]> {
    if (input.quotes.length === 0) {
      return [];
    }

    // If merchant has a specific textual preference, try to use Gemini
    if (input.merchantPreference && input.merchantPreference.trim().length > 0) {
      try {
        return await this.optimizeWithGemini(input);
      } catch (error) {
        this.logger.warn(`Gemini optimization failed, falling back to rule-based weights: ${error instanceof Error ? error.message : String(error)}`);
        return this.optimizeDeterministic(input);
      }
    }

    return this.optimizeDeterministic(input);
  }

  /**
   * Deterministic weighted ranking layer.
   * Price = 50%
   * Delivery Time = 25%
   * Reliability = 15%
   * Regional Performance = 10%
   */
  private optimizeDeterministic(input: OptimizationInput): OptimizedQuote[] {
    const { quotes, receiverCity } = input;

    // Find bounds for price and delivery time normalization
    const prices = quotes.map((q) => q.price);
    const minPrice = Math.min(...prices);
    
    const times = quotes.map((q) => q.deliveryDays);
    const minDays = Math.min(...times);

    const scoredQuotes = quotes.map((quote) => {
      // 1. Price Score (cheaper is better: 100 for minPrice, lower for others)
      const priceScore = quote.price > 0 ? (minPrice / quote.price) * 100 : 0;

      // 2. Delivery Time Score (faster is better: 100 for minDays)
      const deliveryScore = quote.deliveryDays > 0 ? (minDays / quote.deliveryDays) * 100 : 0;

      // 3. Reliability (0-100 direct from DB metric)
      const reliabilityScore = quote.reliabilityScore;

      // 4. Regional Performance (Simulated base on city lookup)
      const regionalScore = this.getSimulatedRegionalScore(quote.providerCode, receiverCity);

      // Blended Score
      const totalScore =
        priceScore * 0.50 +
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
        rank: 1, // Will be set after sorting
        isRecommended: false,
        explanation: `Recommended based on weighted efficiency scoring (Price: ${Math.round(priceScore)}%, Speed: ${Math.round(deliveryScore)}%, Reliability: ${Math.round(reliabilityScore)}%, Region: ${Math.round(regionalScore)}%).`,
      };
    });

    // Sort descending by score
    scoredQuotes.sort((a, b) => b.aiScore - a.aiScore);

    // Populate rank and recommend the top option
    return scoredQuotes.map((q, index) => ({
      ...q,
      rank: index + 1,
      isRecommended: index === 0,
    }));
  }

  /**
   * Gemini-powered optimization layer for semantic merchant preferences.
   */
  private async optimizeWithGemini(input: OptimizationInput): Promise<OptimizedQuote[]> {
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

    interface GeminiRankingResponse {
      rankings: Array<{
        providerCode: string;
        aiScore: number;
        explanation: string;
      }>;
    }

    const aiResponse = await this.aiService.generateJson<GeminiRankingResponse>(systemPrompt, userPrompt);
    
    // Map AI scores and explanations back to deterministic quote values
    const optimizedQuotes = input.quotes.map((quote) => {
      const aiRankInfo = aiResponse.rankings.find(
        (r) => r.providerCode.toLowerCase() === quote.providerCode.toLowerCase()
      );

      const aiScore = aiRankInfo ? aiRankInfo.aiScore : 75.0; // fallback
      const explanation = aiRankInfo ? aiRankInfo.explanation : 'Ranked via AI optimization fallback.';

      return {
        providerCode: quote.providerCode,
        providerName: quote.providerName,
        price: quote.price,
        estimatedDeliveryDays: quote.deliveryDays,
        aiScore: Math.round(aiScore * 10) / 10,
        rank: 1, // Will be set after sorting
        isRecommended: false,
        explanation,
      };
    });

    // Sort descending by score
    optimizedQuotes.sort((a, b) => b.aiScore - a.aiScore);

    // Apply ranks
    return optimizedQuotes.map((q, index) => ({
      ...q,
      rank: index + 1,
      isRecommended: index === 0,
    }));
  }

  /**
   * Helper to simulate regional performance scores.
   */
  private getSimulatedRegionalScore(code: string, city: string): number {
    const cityLower = city.trim().toLowerCase();
    
    // Yurtici Kargo performs exceptionally well in large metropolitan centers
    if (code === 'yurtici') {
      if (['istanbul', 'ankara', 'izmir'].includes(cityLower)) return 96.0;
      return 90.0;
    }
    
    // Aras Kargo has great regional hubs in Marmara/Aegean
    if (code === 'aras') {
      if (['bursa', 'kocaeli', 'izmir', 'manisa'].includes(cityLower)) return 94.0;
      return 88.0;
    }

    // MNG has robust networks in Anatolian cities
    if (code === 'mng') {
      if (['konya', 'kayseri', 'gaziantep', 'adana'].includes(cityLower)) return 92.0;
      return 85.0;
    }

    return 85.0;
  }
}
