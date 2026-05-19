import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';
export declare class MerchantsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByName(merchantName: string): Promise<{
        id: string;
        category: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        normalizedName: string;
        mcc: string | null;
        spendingType: string | null;
        aiMetadata: Prisma.JsonValue | null;
    } | null>;
    upsert(data: {
        name: string;
        category: string;
        mcc?: string;
        spendingType?: string;
        aiMetadata?: Record<string, unknown>;
    }): Promise<{
        id: string;
        category: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        normalizedName: string;
        mcc: string | null;
        spendingType: string | null;
        aiMetadata: Prisma.JsonValue | null;
    }>;
    private normalize;
}
