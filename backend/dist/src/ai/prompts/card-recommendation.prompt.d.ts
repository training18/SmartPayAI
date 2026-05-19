export declare const CARD_RECOMMENDATION_PROMPT: {
    system: string;
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
    }) => string;
};
