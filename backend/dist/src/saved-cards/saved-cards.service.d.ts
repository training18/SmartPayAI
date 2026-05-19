import { PrismaService } from '../prisma';
import { CreateSavedCardDto, UpdateSavedCardDto } from './dto';
export declare class SavedCardsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAllByUser(userId: string): Promise<{
        cardType: import("@prisma/client").$Enums.CardType;
        id: string;
        bankName: string;
        rewardType: import("@prisma/client").$Enums.RewardType;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        last4: string;
        cardAlias: string | null;
        holderName: string | null;
        monthlyLimit: import("@prisma/client-runtime-utils").Decimal | null;
    }[]>;
    create(userId: string, dto: CreateSavedCardDto): Promise<{
        cardType: import("@prisma/client").$Enums.CardType;
        id: string;
        bankName: string;
        rewardType: import("@prisma/client").$Enums.RewardType;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        last4: string;
        cardAlias: string | null;
        holderName: string | null;
        monthlyLimit: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    update(userId: string, cardId: string, dto: UpdateSavedCardDto): Promise<{
        cardType: import("@prisma/client").$Enums.CardType;
        id: string;
        bankName: string;
        rewardType: import("@prisma/client").$Enums.RewardType;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        last4: string;
        cardAlias: string | null;
        holderName: string | null;
        monthlyLimit: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    remove(userId: string, cardId: string): Promise<{
        cardType: import("@prisma/client").$Enums.CardType;
        id: string;
        bankName: string;
        rewardType: import("@prisma/client").$Enums.RewardType;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        last4: string;
        cardAlias: string | null;
        holderName: string | null;
        monthlyLimit: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    findById(cardId: string): Promise<{
        cardType: import("@prisma/client").$Enums.CardType;
        id: string;
        bankName: string;
        rewardType: import("@prisma/client").$Enums.RewardType;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        last4: string;
        cardAlias: string | null;
        holderName: string | null;
        monthlyLimit: import("@prisma/client-runtime-utils").Decimal | null;
    } | null>;
    private ensureOwnership;
}
