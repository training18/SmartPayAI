import { SavedCardsService } from './saved-cards.service';
import { CreateSavedCardDto, UpdateSavedCardDto } from './dto';
import { JwtPayload } from '../common/types';
export declare class SavedCardsController {
    private readonly savedCards;
    constructor(savedCards: SavedCardsService);
    findAll(user: JwtPayload): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        bankName: string;
        cardType: import("@prisma/client").$Enums.CardType;
        first4: string;
        cardAlias: string | null;
        holderName: string | null;
        monthlyLimit: import("@prisma/client-runtime-utils").Decimal | null;
        rewardType: import("@prisma/client").$Enums.RewardType;
    }[]>;
    create(user: JwtPayload, dto: CreateSavedCardDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        bankName: string;
        cardType: import("@prisma/client").$Enums.CardType;
        first4: string;
        cardAlias: string | null;
        holderName: string | null;
        monthlyLimit: import("@prisma/client-runtime-utils").Decimal | null;
        rewardType: import("@prisma/client").$Enums.RewardType;
    }>;
    update(user: JwtPayload, id: string, dto: UpdateSavedCardDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        bankName: string;
        cardType: import("@prisma/client").$Enums.CardType;
        first4: string;
        cardAlias: string | null;
        holderName: string | null;
        monthlyLimit: import("@prisma/client-runtime-utils").Decimal | null;
        rewardType: import("@prisma/client").$Enums.RewardType;
    }>;
    remove(user: JwtPayload, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        bankName: string;
        cardType: import("@prisma/client").$Enums.CardType;
        first4: string;
        cardAlias: string | null;
        holderName: string | null;
        monthlyLimit: import("@prisma/client-runtime-utils").Decimal | null;
        rewardType: import("@prisma/client").$Enums.RewardType;
    }>;
}
