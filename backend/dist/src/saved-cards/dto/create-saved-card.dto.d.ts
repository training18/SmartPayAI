import { CardType, RewardType } from '@prisma/client';
export declare class CreateSavedCardDto {
    bankName: string;
    cardType: CardType;
    first4: string;
    cardAlias?: string;
    holderName?: string;
    monthlyLimit?: number;
    rewardType?: RewardType;
}
