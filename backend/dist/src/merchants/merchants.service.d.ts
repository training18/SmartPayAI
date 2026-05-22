import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';
export declare class MerchantsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByName(merchantName: string): Promise<{
        mcc: string | null;
        category: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        normalizedName: string;
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
        mcc: string | null;
        category: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        normalizedName: string;
        spendingType: string | null;
        aiMetadata: Prisma.JsonValue | null;
    }>;
    private normalize;
}
