import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Prisma } from '@prisma/client';

/**
 * Campaign cache layer (Redis-backed).
 *
 * Provides fast campaign lookups by category + bank with TTL-based
 * invalidation. Falls back to PostgreSQL on cache miss.
 *
 * Cache keys follow the pattern: `campaigns:${category}:${bankHash}`
 */

type CampaignRow = Prisma.CampaignGetPayload<Record<string, never>>;

@Injectable()
export class CampaignCacheService implements OnModuleInit {
  private readonly logger = new Logger(CampaignCacheService.name);
  private readonly ttlMs: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.ttlMs = (this.config.get<number>('CAMPAIGN_CACHE_TTL_SECONDS', 3600)) * 1000;
  }

  async onModuleInit() {
    this.logger.log(`Campaign cache initialized (TTL: ${this.ttlMs / 1000}s)`);
  }

  /**
   * Get active campaigns for a category and optional bank filter.
   *
   * Cache-first: tries Redis, falls back to DB on miss.
   */
  async getActiveCampaigns(
    category: string,
    bankNames?: string[],
  ): Promise<CampaignRow[]> {
    const cacheKey = this.buildCacheKey(category, bankNames);

    // 1. Try cache
    try {
      const cached = await this.cacheManager.get<CampaignRow[]>(cacheKey);
      if (cached && Array.isArray(cached) && cached.length > 0) {
        this.logger.debug(`Campaign cache HIT: ${cacheKey} (${cached.length} campaigns)`);
        return cached;
      }
    } catch (error) {
      this.logger.warn(`Cache read failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    // 2. Cache miss — query DB
    this.logger.debug(`Campaign cache MISS: ${cacheKey} — querying DB`);
    const campaigns = await this.queryDb(category, bankNames);

    // 3. Write to cache
    try {
      await this.cacheManager.set(cacheKey, campaigns, this.ttlMs);
    } catch (error) {
      this.logger.warn(`Cache write failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    return campaigns;
  }

  /**
   * Invalidate all campaign cache entries.
   *
   * Called after a campaign refresh to ensure fresh data.
   */
  async invalidateAll(): Promise<void> {
    try {
      await this.cacheManager.clear();
      this.logger.log('Campaign cache invalidated');
    } catch (error) {
      this.logger.warn(`Cache invalidation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Invalidate cache for a specific category.
   */
  async invalidateByCategory(category: string): Promise<void> {
    // With cache-manager we can't efficiently invalidate by prefix,
    // so we reset all. In production, use a Redis SCAN with prefix.
    await this.invalidateAll();
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private async queryDb(
    category: string,
    bankNames?: string[],
  ): Promise<CampaignRow[]> {
    const where: Prisma.CampaignWhereInput = {
      isActive: true,
      category,
    };

    if (bankNames?.length) {
      where.bankName = { in: bankNames };
    }

    return this.prisma.campaign.findMany({
      where,
      orderBy: { rewardRate: 'desc' },
    });
  }

  private buildCacheKey(category: string, bankNames?: string[]): string {
    const banks = bankNames?.sort().join(',') ?? 'all';
    return `campaigns:${category}:${banks}`;
  }
}
