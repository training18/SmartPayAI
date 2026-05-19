/**
 * Card recommendation prompt template.
 *
 * Consumes pre-scored candidates from `CardScoringService` — the deterministic
 * layer has already filtered campaigns by bank/category/network and computed
 * the realized reward per card. The model's job is final selection,
 * reasoning, and per-card rejection commentary.
 */
export interface ScoredCandidatePromptInput {
  cardId: string;
  bankName: string;
  cardType: string;
  first4: string;
  network: string;
  networkLabel: string;
  cardAlias?: string | null;
  rewardType: string;
  /** Pre-computed best reward for this transaction, if any campaign matched. */
  expectedReward: {
    value: number;
    unit: string;
    type: string;
    campaignTitle: string;
    installments?: number | null;
  } | null;
  /** Brief listing of every qualifying campaign for full transparency. */
  matchedCampaigns: Array<{
    title: string;
    rewardRate: number;
    rewardValue: number;
    rewardUnit: string;
  }>;
}

export const CARD_RECOMMENDATION_PROMPT = {
  system: `You are SmartPay's AI payment orchestration engine for the Turkish market.

A deterministic scoring layer has already filtered each user card against active bank campaigns (matching bank, merchant category, card type, and network) and pre-computed the realized reward in real currency / points. You receive STRUCTURED CANDIDATES — do NOT recompute rewards.

Your responsibilities:
1. Pick the single most profitable card from the candidates. Compare cashback (TL) head-to-head, but for points/miles apply a reasonable monetary heuristic when weighing different reward kinds.
2. Produce a concise human-readable REASON explaining WHY the winner beats the others. Mention the bank, network tier (Visa / Mastercard / Troy / Amex), and the active campaign title that justifies the pick.
3. For every NON-winning card, write one short rejection line that the end user will see (e.g. "No active grocery campaign on this network").
4. Output STRICT JSON only. No prose, no markdown fences.

Tone: write the reason in the user-facing language (Turkish if the merchant/category looks Turkish, otherwise English). Keep it under 220 characters.`,

  buildUserPrompt: (context: {
    merchantName: string;
    merchantCategory: string;
    amount: number;
    currency: string;
    candidates: ScoredCandidatePromptInput[];
  }) => {
    const candidateLines = context.candidates
      .map((c, i) => {
        const head = `${i + 1}. id=${c.cardId} · ${c.bankName} ${c.cardAlias ?? ''} (${c.first4}****) · network=${c.networkLabel} · type=${c.cardType} · rewardPref=${c.rewardType}`;
        const reward = c.expectedReward
          ? `   best campaign: "${c.expectedReward.campaignTitle}" → ${c.expectedReward.value} ${c.expectedReward.unit} (${c.expectedReward.type})${c.expectedReward.installments ? ` · ${c.expectedReward.installments} installments` : ''}`
          : `   best campaign: none — no active campaign for this category/bank/network`;
        const others =
          c.matchedCampaigns.length > 1
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
  "reason": "Why this card wins — mention bank, network, and matched campaign",
  "estimatedBenefit": "e.g. '120.00 TL cashback' or '240 points'",
  "confidence": 0.0,
  "rewardBreakdown": {
    "type": "CASHBACK | POINTS | MILES | INSTALLMENT | DISCOUNT",
    "value": 0,
    "unit": "TL | points | miles | installments"
  },
  "rejectedCards": [
    { "cardId": "id", "reason": "short user-facing reason" }
  ]
}`;
  },
};
