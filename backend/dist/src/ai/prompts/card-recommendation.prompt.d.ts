export interface ScoredCandidatePromptInput {
    cardId: string;
    bankName: string;
    cardType: string;
    first4: string;
    network: string;
    networkLabel: string;
    cardAlias?: string | null;
    rewardType: string;
    expectedReward: {
        value: number;
        valueTL: number;
        unit: string;
        type: string;
        campaignTitle: string;
    } | null;
    matchedCampaigns: Array<{
        title: string;
        rewardRate: number;
        rewardValue: number;
        rewardUnit: string;
    }>;
}
export declare const CARD_RECOMMENDATION_PROMPT: {
    system: string;
    buildUserPrompt: (context: {
        merchantName: string;
        merchantCategory: string;
        amount: number;
        currency: string;
        candidates: ScoredCandidatePromptInput[];
    }) => string;
};
