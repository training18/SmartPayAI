import { PrismaService } from '../prisma';
import { CreateCampaignDto } from './dto';
export declare class CampaignsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(filters?: {
        category?: string;
        bankName?: string;
        cardType?: string;
    }): Promise<{
        installmentCount: number | null;
        maxReward: import("@prisma/client-runtime-utils").Decimal | null;
        cardType: import("@prisma/client").$Enums.CardType | null;
        minAmount: import("@prisma/client-runtime-utils").Decimal | null;
        id: string;
        title: string;
        description: string;
        bankName: string;
        rewardType: import("@prisma/client").$Enums.RewardType;
        category: string;
        rewardRate: import("@prisma/client-runtime-utils").Decimal;
        isActive: boolean;
        startsAt: Date;
        endsAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findByCategory(category: string, bankNames?: string[]): Promise<{
        installmentCount: number | null;
        maxReward: import("@prisma/client-runtime-utils").Decimal | null;
        cardType: import("@prisma/client").$Enums.CardType | null;
        minAmount: import("@prisma/client-runtime-utils").Decimal | null;
        id: string;
        title: string;
        description: string;
        bankName: string;
        rewardType: import("@prisma/client").$Enums.RewardType;
        category: string;
        rewardRate: import("@prisma/client-runtime-utils").Decimal;
        isActive: boolean;
        startsAt: Date;
        endsAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    create(dto: CreateCampaignDto): Promise<{
        installmentCount: number | null;
        maxReward: import("@prisma/client-runtime-utils").Decimal | null;
        cardType: import("@prisma/client").$Enums.CardType | null;
        minAmount: import("@prisma/client-runtime-utils").Decimal | null;
        id: string;
        title: string;
        description: string;
        bankName: string;
        rewardType: import("@prisma/client").$Enums.RewardType;
        category: string;
        rewardRate: import("@prisma/client-runtime-utils").Decimal;
        isActive: boolean;
        startsAt: Date;
        endsAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
