import { PrismaService } from '../prisma';
import { CreateCampaignDto } from './dto';
export declare class CampaignsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(filters?: {
        category?: string;
        bankName?: string;
        cardType?: string;
    }): Promise<{
        category: string;
        description: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        source: import("@prisma/client").$Enums.CampaignSource;
        title: string;
        bankName: string;
        cardType: import("@prisma/client").$Enums.CardType | null;
        rewardType: import("@prisma/client").$Enums.RewardType;
        rewardRate: import("@prisma/client-runtime-utils").Decimal;
        minAmount: import("@prisma/client-runtime-utils").Decimal | null;
        maxReward: import("@prisma/client-runtime-utils").Decimal | null;
        installmentCount: number | null;
        endsAt: Date | null;
        sourceId: string | null;
        rawText: string | null;
        network: string | null;
        channels: string[];
        rewardCurrency: string | null;
        parsedByAi: boolean;
        fetchedAt: Date | null;
        startsAt: Date;
    }[]>;
    findByCategory(category: string, bankNames?: string[]): Promise<{
        category: string;
        description: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        source: import("@prisma/client").$Enums.CampaignSource;
        title: string;
        bankName: string;
        cardType: import("@prisma/client").$Enums.CardType | null;
        rewardType: import("@prisma/client").$Enums.RewardType;
        rewardRate: import("@prisma/client-runtime-utils").Decimal;
        minAmount: import("@prisma/client-runtime-utils").Decimal | null;
        maxReward: import("@prisma/client-runtime-utils").Decimal | null;
        installmentCount: number | null;
        endsAt: Date | null;
        sourceId: string | null;
        rawText: string | null;
        network: string | null;
        channels: string[];
        rewardCurrency: string | null;
        parsedByAi: boolean;
        fetchedAt: Date | null;
        startsAt: Date;
    }[]>;
    create(dto: CreateCampaignDto): Promise<{
        category: string;
        description: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        source: import("@prisma/client").$Enums.CampaignSource;
        title: string;
        bankName: string;
        cardType: import("@prisma/client").$Enums.CardType | null;
        rewardType: import("@prisma/client").$Enums.RewardType;
        rewardRate: import("@prisma/client-runtime-utils").Decimal;
        minAmount: import("@prisma/client-runtime-utils").Decimal | null;
        maxReward: import("@prisma/client-runtime-utils").Decimal | null;
        installmentCount: number | null;
        endsAt: Date | null;
        sourceId: string | null;
        rawText: string | null;
        network: string | null;
        channels: string[];
        rewardCurrency: string | null;
        parsedByAi: boolean;
        fetchedAt: Date | null;
        startsAt: Date;
    }>;
    expireOld(): Promise<number>;
    getStats(): Promise<{
        total: number;
        active: number;
        sources: {
            scraped: number;
            manual: number;
            seed: number;
        };
        byBank: {
            bankName: string;
            count: number;
        }[];
        byCategory: {
            category: string;
            count: number;
        }[];
    }>;
}
