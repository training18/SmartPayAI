import { CardType, RewardType } from '@prisma/client';
export declare class CreateCampaignDto {
    title: string;
    description: string;
    bankName: string;
    cardType?: CardType;
    rewardType: RewardType;
    category: string;
    rewardRate: number;
    minAmount?: number;
    maxReward?: number;
    installmentCount?: number;
    isActive?: boolean;
    endsAt?: string;
}
