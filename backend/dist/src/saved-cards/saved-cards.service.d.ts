import { PrismaService } from '../prisma';
import { CreateSavedCardDto, UpdateSavedCardDto } from './dto';
export declare class SavedCardsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAllByUser(userId: string): Promise<{
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
    create(userId: string, dto: CreateSavedCardDto): Promise<{
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
    update(userId: string, cardId: string, dto: UpdateSavedCardDto): Promise<{
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
    remove(userId: string, cardId: string): Promise<{
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
    findById(cardId: string): Promise<{
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
    } | null>;
    private ensureOwnership;
}
