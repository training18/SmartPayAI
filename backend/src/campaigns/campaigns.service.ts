import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateCampaignDto } from './dto';

@Injectable()
export class CampaignsService {
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
}
