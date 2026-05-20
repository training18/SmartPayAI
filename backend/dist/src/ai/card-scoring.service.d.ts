import { Prisma, RewardType, CardType } from '@prisma/client';
import { CardNetwork } from '../saved-cards/utils/card-network.util';
type SavedCardRow = Prisma.SavedCardGetPayload<Record<string, never>>;
type CampaignRow = Prisma.CampaignGetPayload<Record<string, never>>;
export interface CampaignMatch {
    campaignId: string;
    title: string;
    rewardType: RewardType;
    rewardRate: number;
    rewardValue: number;
    rewardValueTL: number;
    rewardUnit: string;
    description: string;
}
export interface ScoredCard {
    cardId: string;
    bankName: string;
    cardType: CardType;
    first4: string;
    network: CardNetwork;
    networkLabel: string;
    cardAlias: string | null;
    rewardType: RewardType;
    bestMatch: CampaignMatch | null;
    matches: CampaignMatch[];
    score: number;
}
export declare class CardScoringService {
    private readonly logger;
    scoreCards(cards: SavedCardRow[], campaigns: CampaignRow[], amount: number): ScoredCard[];
    private scoreSingleCard;
    private campaignApplies;
    private extractRequiredNetwork;
    private computeReward;
    private toTL;
    private unitFor;
}
export {};
