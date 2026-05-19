/**
 * Card recommendation prompt template.
 *
 * Instructs the AI to evaluate user cards + active campaigns and recommend
 * the optimal card with human-readable reasoning.
 */
export const CARD_RECOMMENDATION_PROMPT = {
  system: `You are a fintech AI card recommendation engine for SmartPay, a Turkish payment optimization platform.

Your job is to analyze the user's saved cards, active bank campaigns, and the merchant context to recommend the single best card that maximizes the user's financial benefit.

You must consider:
1. Active campaigns matching the merchant category and bank
2. Card reward types (cashback, points, miles, installment options)
3. Transaction amount and potential reward value
4. Campaign reward rates and limits

You MUST respond in valid JSON format only, with no additional text.

IMPORTANT: Your reasoning must be a clear, human-readable explanation in Turkish or English that the user can understand. Be specific about WHY this card is best.`,

  buildUserPrompt: (context: {
    merchantName: string;
    merchantCategory: string;
    amount: number;
    currency: string;
    userCards: Array<{
      id: string;
      bankName: string;
      cardType: string;
      last4: string;
      cardAlias?: string;
      rewardType: string;
    }>;
    activeCampaigns: Array<{
      title: string;
      bankName: string;
      category: string;
      rewardType: string;
      rewardRate: number;
      maxReward?: number;
      installmentCount?: number;
      description: string;
    }>;
  }) => {
    return `Transaction Context:
- Merchant: ${context.merchantName}
- Category: ${context.merchantCategory}
- Amount: ${context.amount} ${context.currency}

User's Cards:
${context.userCards.map((c, i) => `${i + 1}. ${c.bankName} ${c.cardAlias ?? ''} (****${c.last4}) - Type: ${c.cardType}, Rewards: ${c.rewardType}`).join('\n')}

Active Campaigns for "${context.merchantCategory}" category:
${context.activeCampaigns.length > 0
  ? context.activeCampaigns.map((c, i) => `${i + 1}. [${c.bankName}] ${c.title} - ${c.rewardType} ${c.rewardRate}%${c.maxReward ? ` (max ${c.maxReward} TL)` : ''}${c.installmentCount ? ` - ${c.installmentCount} installments` : ''}\n   ${c.description}`).join('\n')
  : 'No specific campaigns found for this category.'}

Recommend the best card. Respond with JSON:
{
  "recommendedCardId": "card_id_from_list",
  "recommendedBank": "bank name",
  "reason": "Detailed human-readable explanation of why this card is best for this purchase",
  "estimatedBenefit": "e.g. '15.00 TL cashback' or '3x points' or '6 installments available'",
  "confidence": 0.0 to 1.0,
  "rewardBreakdown": {
    "type": "cashback|points|miles|installment|discount",
    "value": numeric_value,
    "unit": "TL|points|miles"
  }
}`;
  },
};
