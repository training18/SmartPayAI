import { SavedCardsService } from './saved-cards.service';
import { CreateSavedCardDto, UpdateSavedCardDto } from './dto';
import { JwtPayload } from '../common/types';
export declare class SavedCardsController {
    private readonly savedCards;
    constructor(savedCards: SavedCardsService);
    findAll(user: JwtPayload): Promise<{
        cardType: import("@prisma/client").$Enums.CardType;
        id: string;
        bankName: string;
        rewardType: import("@prisma/client").$Enums.RewardType;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        first4: string;
        cardAlias: string | null;
        holderName: string | null;
        monthlyLimit: import("@prisma/client-runtime-utils").Decimal | null;
    }[]>;
    create(user: JwtPayload, dto: CreateSavedCardDto): Promise<{
        cardType: import("@prisma/client").$Enums.CardType;
        id: string;
        bankName: string;
        rewardType: import("@prisma/client").$Enums.RewardType;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        first4: string;
        cardAlias: string | null;
        holderName: string | null;
        monthlyLimit: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    update(user: JwtPayload, id: string, dto: UpdateSavedCardDto): Promise<{
        cardType: import("@prisma/client").$Enums.CardType;
        id: string;
        bankName: string;
        rewardType: import("@prisma/client").$Enums.RewardType;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        first4: string;
        cardAlias: string | null;
        holderName: string | null;
        monthlyLimit: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    remove(user: JwtPayload, id: string): Promise<{
        cardType: import("@prisma/client").$Enums.CardType;
        id: string;
        bankName: string;
        rewardType: import("@prisma/client").$Enums.RewardType;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        first4: string;
        cardAlias: string | null;
        holderName: string | null;
        monthlyLimit: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
}
