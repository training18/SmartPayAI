import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateCampaignDto } from './dto';
import { CampaignSource } from '@prisma/client';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** List active campaigns, optionally filtered by category/bank/cardType. */
  async findAll(filters?: { category?: string; bankName?: string; cardType?: string }) {
    const where: Record<string, unknown> = { isActive: true };

    if (filters?.category) where.category = filters.category;
    if (filters?.bankName) where.bankName = filters.bankName;
    if (filters?.cardType) where.cardType = filters.cardType;

    return this.prisma.campaign.findMany({
      where,
      orderBy: { rewardRate: 'desc' },
    });
  }

  /** Find campaigns matching a specific merchant category and optionally a bank. */
  async findByCategory(category: string, bankNames?: string[]) {
    const where: Record<string, unknown> = {
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

  /** Create a new campaign. */
  async create(dto: CreateCampaignDto) {
    return this.prisma.campaign.create({ data: dto });
  }

  /** Mark expired campaigns as inactive. */
  async expireOld(): Promise<number> {
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

  /** Get campaign statistics for monitoring. */
  async getStats() {
    const [total, active, scraped, manual, seed] = await Promise.all([
      this.prisma.campaign.count(),
      this.prisma.campaign.count({ where: { isActive: true } }),
      this.prisma.campaign.count({ where: { source: CampaignSource.SCRAPED } }),
      this.prisma.campaign.count({ where: { source: CampaignSource.MANUAL } }),
      this.prisma.campaign.count({ where: { source: CampaignSource.SEED } }),
    ]);

    // Get per-bank breakdown
    const byBank = await this.prisma.campaign.groupBy({
      by: ['bankName'],
      where: { isActive: true },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    // Get per-category breakdown
    const byCategory = await this.prisma.campaign.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    return {
      total,
      active,
      sources: { scraped, manual, seed },
      byBank: byBank.map((b) => ({ bankName: b.bankName, count: b._count.id })),
      byCategory: byCategory.map((c) => ({ category: c.category, count: c._count.id })),
    };
  }
}
