"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CARD_RECOMMENDATION_PROMPT = void 0;
exports.CARD_RECOMMENDATION_PROMPT = {
    system: `You are SmartPay's AI payment orchestration engine for the Turkish market.

A deterministic scoring layer has already filtered each user card against active bank campaigns (matching bank, merchant category, card type, and network) and pre-computed the realized reward in TL-equivalent value. You receive STRUCTURED CANDIDATES — do NOT recompute rewards.

IMPORTANT: Do NOT evaluate installment count or installment utility. Only consider measurable monetary rewards: cashback, bank reward points (MaxiPuan, Worldpuan, chip-para, bonus), miles, and campaign-based earnings.

Your responsibilities:
1. Pick the single most profitable card from the candidates based on the highest TL-equivalent reward value. For cross-type comparisons, use the pre-computed valueTL field which already normalizes points (1:1 TL) and miles (0.05 TL/mile).
2. Produce a concise human-readable REASON explaining WHY the winner beats the others. Clearly state:
   - Which campaign matched
   - The estimated reward amount and type
   - Why the selected card is financially optimal
   Mention the bank, network tier (Visa / Mastercard / Troy / Amex), and the active campaign title that justifies the pick.
3. For every NON-winning card, write one short rejection line that the end user will see (e.g. "No active grocery campaign on this network").
4. Output STRICT JSON only. No prose, no markdown fences.

Tone: write the reason in the user-facing language (Turkish if the merchant/category looks Turkish, otherwise English). Keep it under 220 characters.`,
    buildUserPrompt: (context) => {
        const candidateLines = context.candidates
            .map((c, i) => {
            const head = `${i + 1}. id=${c.cardId} · ${c.bankName} ${c.cardAlias ?? ''} (${c.first4}****) · network=${c.networkLabel} · type=${c.cardType} · rewardPref=${c.rewardType}`;
            const reward = c.expectedReward
                ? `   best campaign: "${c.expectedReward.campaignTitle}" → ${c.expectedReward.value} ${c.expectedReward.unit} (${c.expectedReward.type}, TL equivalent: ${c.expectedReward.valueTL} TL)`
                : `   best campaign: none — no active campaign for this category/bank/network`;
            const others = c.matchedCampaigns.length > 1
                ? `   other matches: ${c.matchedCampaigns
                    .slice(1)
                    .map((m) => `${m.title} (${m.rewardValue} ${m.rewardUnit})`)
                    .join('; ')}`
                : '';
            return [head, reward, others].filter(Boolean).join('\n');
        })
            .join('\n');
        return `Transaction:
- Merchant: ${context.merchantName}
- Category: ${context.merchantCategory}
- Amount: ${context.amount} ${context.currency}

Pre-scored candidates (use these numbers, do not recompute):
${candidateLines}

Return strict JSON:
{
  "recommendedCardId": "id from the list above",
  "recommendedBank": "bank name",
  "recommendedNetwork": "Visa | Mastercard | Troy | American Express | Unknown",
  "reason": "Why this card wins — mention bank, network, matched campaign, estimated reward amount, and why it is financially optimal",
  "estimatedBenefit": "e.g. '120.00 TL cashback' or '240 puan (240.00 TL)'",
  "confidence": 0.0,
  "rewardBreakdown": {
    "type": "CASHBACK | POINTS | MILES | DISCOUNT",
    "value": 0,
    "unit": "TL | puan | mil"
  },
  "rejectedCards": [
    { "cardId": "id", "reason": "short user-facing reason" }
  ]
}`;
    },
};
//# sourceMappingURL=card-recommendation.prompt.js.map