import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma';
import type { Cache } from 'cache-manager';
import { Prisma } from '@prisma/client';
type CampaignRow = Prisma.CampaignGetPayload<Record<string, never>>;
export declare class CampaignCacheService implements OnModuleInit {
    private readonly prisma;
    private readonly config;
    private readonly cacheManager;
    private readonly logger;
    private readonly ttlMs;
    constructor(prisma: PrismaService, config: ConfigService, cacheManager: Cache);
    onModuleInit(): Promise<void>;
    getActiveCampaigns(category: string, bankNames?: string[]): Promise<CampaignRow[]>;
    invalidateAll(): Promise<void>;
    invalidateByCategory(category: string): Promise<void>;
    private queryDb;
    private buildCacheKey;
}
export {};
