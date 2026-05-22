import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CampaignParserService, ParsedCampaign } from './campaign-parser.service';
import { CampaignCacheService } from './campaign-cache.service';
import {
  BankConnector,
  RawBankCampaign,
  AkbankConnector,
  IsbankConnector,
  GarantiConnector,
  YkbConnector,
} from './connectors';
import { RewardType, CardType, CampaignSource } from '@prisma/client';
import { createHash } from 'crypto';

/**
 * Campaign Aggregation Orchestrator.
 *
 * Coordinates the full real-time campaign intelligence pipeline:
 * 1. Fetch raw campaigns from all bank connectors in parallel
 * 2. Parse unstructured text via AI
 * 3. Normalize to Campaign schema
 * 4. Deduplicate using sourceId (hash)
 * 5. Upsert into PostgreSQL
 * 6. Invalidate Redis cache
 * 7. Expire old campaigns
 */
@Injectable()
export class CampaignAggregatorService {
  private readonly logger = new Logger(CampaignAggregatorService.name);
  private readonly connectors: BankConnector[];

  constructor(
    private readonly prisma: PrismaService,
    private readonly parser: CampaignParserService,
    private readonly cache: CampaignCacheService,
    akbank: AkbankConnector,
    isbank: IsbankConnector,
    garanti: GarantiConnector,
    ykb: YkbConnector,
  ) {
    this.connectors = [akbank, isbank, garanti, ykb];
  }

  /**
   * Run the full campaign refresh pipeline.
   *
   * Returns a summary of what was fetched, parsed, and persisted.
   */
  async refreshAll(): Promise<RefreshSummary> {
    const startTime = Date.now();
    this.logger.log('Starting campaign refresh pipeline...');

    // 1. Fetch from all connectors in parallel
    const fetchResults = await Promise.allSettled(
      this.connectors.map((c) => this.fetchSafe(c)),
    );

    const rawCampaigns: RawBankCampaign[] = [];
    const errors: string[] = [];

    for (const result of fetchResults) {
      if (result.status === 'fulfilled') {
        rawCampaigns.push(...result.value);
      } else {
        errors.push(String(result.reason));
      }
    }

    this.logger.log(`Fetched ${rawCampaigns.length} raw campaigns from ${this.connectors.length} banks`);

    // 2. Parse all campaigns via AI
    const parsed = await this.parser.parseBatch(rawCampaigns);

    // 3. Deduplicate + normalize + upsert
    let upsertedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < rawCampaigns.length; i++) {
      const raw = rawCampaigns[i];
      const campaign = parsed[i];

      try {
        const sourceId = this.generateSourceId(raw.bankName, campaign.title, campaign.category);
        await this.upsertCampaign(raw, campaign, sourceId);
        upsertedCount++;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Failed to upsert campaign "${campaign.title}": ${msg}`);
        skippedCount++;
      }
    }

    // 4. Expire old campaigns
    const expiredCount = await this.expireOldCampaigns();

    // 5. Invalidate cache
    await this.cache.invalidateAll();

    const duration = Date.now() - startTime;
    const summary: RefreshSummary = {
      fetchedCount: rawCampaigns.length,
      parsedCount: parsed.length,
      upsertedCount,
      skippedCount,
      expiredCount,
      errors,
      durationMs: duration,
      refreshedAt: new Date().toISOString(),
    };

    this.logger.log(
      `Campaign refresh complete: ${upsertedCount} upserted, ${skippedCount} skipped, ` +
      `${expiredCount} expired, ${duration}ms`,
    );

    return summary;
  }

  /**
   * Refresh campaigns for specific bank(s) only.
   */
  async refreshByBanks(bankCodes: string[]): Promise<RefreshSummary> {
    const targets = this.connectors.filter((c) => bankCodes.includes(c.bankCode));

    if (targets.length === 0) {
      return {
        fetchedCount: 0,
        parsedCount: 0,
        upsertedCount: 0,
        skippedCount: 0,
        expiredCount: 0,
        errors: [`No connectors found for: ${bankCodes.join(', ')}`],
        durationMs: 0,
        refreshedAt: new Date().toISOString(),
      };
    }

    const startTime = Date.now();
    const rawCampaigns: RawBankCampaign[] = [];

    for (const connector of targets) {
      const fetched = await this.fetchSafe(connector);
      rawCampaigns.push(...fetched);
    }

    const parsed = await this.parser.parseBatch(rawCampaigns);
    let upsertedCount = 0;

    for (let i = 0; i < rawCampaigns.length; i++) {
      const raw = rawCampaigns[i];
      const campaign = parsed[i];

      try {
        const sourceId = this.generateSourceId(raw.bankName, campaign.title, campaign.category);
        await this.upsertCampaign(raw, campaign, sourceId);
        upsertedCount++;
      } catch { /* skip */ }
    }

    await this.cache.invalidateAll();

    return {
      fetchedCount: rawCampaigns.length,
      parsedCount: parsed.length,
      upsertedCount,
      skippedCount: rawCampaigns.length - upsertedCount,
      expiredCount: 0,
      errors: [],
      durationMs: Date.now() - startTime,
      refreshedAt: new Date().toISOString(),
    };
  }

  /**
   * Get list of available bank connectors.
   */
  getAvailableBanks(): Array<{ bankCode: string; bankName: string }> {
    return this.connectors.map((c) => ({ bankCode: c.bankCode, bankName: c.bankName }));
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private async fetchSafe(connector: BankConnector): Promise<RawBankCampaign[]> {
    try {
      return await connector.fetch();
    } catch (error) {
      this.logger.error(
        `Connector ${connector.bankCode} failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return [];
    }
  }

  private async upsertCampaign(
    raw: RawBankCampaign,
    parsed: ParsedCampaign,
    sourceId: string,
  ): Promise<void> {
    const rewardType = this.mapRewardType(parsed.rewardType);
    const cardType = parsed.cardType ? (parsed.cardType as CardType) : null;

    const data = {
      title: parsed.title,
      description: raw.rawText.slice(0, 500),
      bankName: raw.bankName,
      cardType,
      rewardType,
      category: parsed.category,
      rewardRate: parsed.rewardPercent,
      minAmount: parsed.minAmount,
      maxReward: parsed.maxReward,
      isActive: true,
      source: CampaignSource.SCRAPED,
      sourceId,
      rawText: raw.rawText,
      network: parsed.network,
      channels: parsed.channels,
      rewardCurrency: parsed.rewardCurrency,
      parsedByAi: true,
      fetchedAt: raw.fetchedAt,
      endsAt: parsed.endsAt ? new Date(parsed.endsAt) : null,
    };

    await this.prisma.campaign.upsert({
      where: { sourceId },
      create: data,
      update: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  private mapRewardType(type: string): RewardType {
    switch (type) {
      case 'CASHBACK': return RewardType.CASHBACK;
      case 'POINTS': return RewardType.POINTS;
      case 'MILES': return RewardType.MILES;
      case 'DISCOUNT': return RewardType.DISCOUNT;
      default: return RewardType.NONE;
    }
  }

  private generateSourceId(bankName: string, title: string, category: string): string {
    const input = `${bankName}::${title}::${category}`.toLowerCase();
    return createHash('sha256').update(input).digest('hex').slice(0, 16);
  }

  private async expireOldCampaigns(): Promise<number> {
    const result = await this.prisma.campaign.updateMany({
      where: {
        isActive: true,
        endsAt: { lt: new Date() },
      },
      data: { isActive: false },
    });

    if (result.count > 0) {
      this.logger.log(`Expired ${result.count} campaigns past their end date`);
    }

    return result.count;
  }
}

export interface RefreshSummary {
  fetchedCount: number;
  parsedCount: number;
  upsertedCount: number;
  skippedCount: number;
  expiredCount: number;
  errors: string[];
  durationMs: number;
  refreshedAt: string;
}
