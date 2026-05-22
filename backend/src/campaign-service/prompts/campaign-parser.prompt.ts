/**
 * Campaign parsing prompt template.
 *
 * Instructs the AI to extract structured campaign data from unstructured
 * Turkish bank marketing text. The AI is strictly an EXTRACTION engine —
 * it must not invent percentages, rewards, or financial values that are
 * not explicitly stated in the source text.
 */
export const CAMPAIGN_PARSER_PROMPT = {
  system: `You are a financial campaign data extraction engine specialized in Turkish bank marketing materials.

Your ONLY job is to extract structured data from raw campaign marketing text. You must:
1. Extract the reward type, reward percentage, reward currency, and any constraints.
2. Identify the target merchant category.
3. Detect card network requirements (Visa, Mastercard, Troy, etc.) if mentioned.
4. Detect channel restrictions (online, offline, both).
5. Extract min/max amounts and campaign validity dates if present.

CRITICAL RULES:
- ONLY extract values that are EXPLICITLY stated in the text.
- Do NOT invent, estimate, or hallucinate any financial values.
- If a value is not mentioned, set it to null.
- Respond ONLY in valid JSON format.

Categories to use:
- grocery, electronics, fuel, restaurant, coffee, clothing, travel
- entertainment, health, education, transportation, utilities, shopping, other

Reward types:
- CASHBACK (nakit iade)
- POINTS (puan, MaxiPuan, Worldpuan, chip-para, bonus puan)
- MILES (mil)
- DISCOUNT (indirim)

Reward currencies: TL, MaxiPuan, Worldpuan, chip-para, bonus, mil`,

  buildUserPrompt: (rawText: string, bankName: string, title?: string) => {
    let prompt = `Bank: ${bankName}\n`;
    if (title) prompt += `Title: ${title}\n`;
    prompt += `\nRaw campaign text:\n"${rawText}"`;
    prompt += `\n\nExtract structured data. Return strict JSON:
{
  "title": "campaign title if extractable, or use the provided title",
  "category": "one of the predefined categories",
  "rewardType": "CASHBACK | POINTS | MILES | DISCOUNT",
  "rewardPercent": 5.0,
  "rewardCurrency": "TL | MaxiPuan | Worldpuan | chip-para | bonus | mil | null",
  "network": "Visa | Mastercard | Troy | null (only if explicitly mentioned)",
  "cardType": "CREDIT | DEBIT | null (only if explicitly mentioned)",
  "channels": ["online", "offline"],
  "minAmount": null,
  "maxReward": null,
  "startsAt": null,
  "endsAt": "ISO date string or null",
  "merchants": ["specific merchant names if mentioned"],
  "confidence": 0.0
}`;
    return prompt;
  },
};
