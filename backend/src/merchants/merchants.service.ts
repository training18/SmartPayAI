import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';

/**
 * Merchants service — caches AI-analyzed merchant data to avoid re-analysis.
 */
@Injectable()
export class MerchantsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Find cached merchant by normalized name. */
  async findByName(merchantName: string) {
    const normalized = this.normalize(merchantName);
    return this.prisma.merchant.findUnique({
      where: { normalizedName: normalized },
    });
  }

  /** Cache a new merchant analysis result. */
  async upsert(data: {
    name: string;
    category: string;
    mcc?: string;
    spendingType?: string;
    aiMetadata?: Record<string, unknown>;
  }) {
    const normalized = this.normalize(data.name);
    const metadata = (data.aiMetadata ?? {}) as Prisma.InputJsonValue;

    return this.prisma.merchant.upsert({
      where: { normalizedName: normalized },
      create: {
        name: data.name,
        normalizedName: normalized,
        category: data.category,
        mcc: data.mcc,
        spendingType: data.spendingType,
        aiMetadata: metadata,
      },
      update: {
        category: data.category,
        mcc: data.mcc,
        spendingType: data.spendingType,
        aiMetadata: metadata,
      },
    });
  }

  /** Normalize merchant name for consistent lookups. */
  private normalize(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  }
}
