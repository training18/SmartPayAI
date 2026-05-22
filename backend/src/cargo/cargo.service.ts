import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { YurticiCargoAdapter } from './providers/yurtici.adapter';
import { MngCargoAdapter } from './providers/mng.adapter';
import { ArasCargoAdapter } from './providers/aras.adapter';
import { CargoRulesEngine } from './engines/cargo-rules.engine';
import { CargoAiOptimizationService, ProviderMetrics } from './engines/cargo-ai-optimization.service';
import { CargoProviderAdapter } from './providers/cargo-provider.interface';

export interface GetQuotesParams {
  senderName: string;
  senderAddress: string;
  senderCity: string;
  receiverName: string;
  receiverAddress: string;
  receiverCity: string;
  width: number;
  height: number;
  length: number;
  weight: number;
  merchantPreference?: string;
}

export interface CreateShipmentParams extends GetQuotesParams {
  selectedProviderCode: string;
}

@Injectable()
export class CargoService {
  private readonly logger = new Logger(CargoService.name);
  private readonly adapters: Record<string, CargoProviderAdapter>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly rulesEngine: CargoRulesEngine,
    private readonly aiOptimizer: CargoAiOptimizationService,
    yurtici: YurticiCargoAdapter,
    mng: MngCargoAdapter,
    aras: ArasCargoAdapter,
  ) {
    this.adapters = {
      yurtici,
      mng,
      aras,
    };
  }

  /**
   * Calculates volumetric weight (Desi) using standard logistics formula: (W * H * L) / 3000
   * Using 3000 for local courier services in Turkey.
   */
  calculateDesi(width: number, height: number, length: number): number {
    return Math.round(((width * height * length) / 3000) * 100) / 100;
  }

  /**
   * Retrieves quotes from all active cargo providers, filters them via Rule Engine,
   * and ranks them via AI Optimization Layer.
   */
  async getQuotesAndOptimize(userId: string, params: GetQuotesParams) {
    const desi = this.calculateDesi(params.width, params.height, params.length);

    // Fetch active providers from database
    const dbProviders = await this.prisma.cargoProvider.findMany({
      where: { isActive: true },
    });

    if (dbProviders.length === 0) {
      throw new BadRequestException('No active cargo providers configured in the system.');
    }

    const eligibleQuotesForAI: ProviderMetrics[] = [];
    const comparisonResults: any[] = [];

    for (const provider of dbProviders) {
      // 1. Evaluate Rule Engine constraints
      const ruleResult = this.rulesEngine.evaluate({
        providerCode: provider.code,
        weight: params.weight,
        desi,
        senderCity: params.senderCity,
        receiverCity: params.receiverCity,
      });

      if (!ruleResult.isEligible) {
        comparisonResults.push({
          providerId: provider.id,
          providerCode: provider.code,
          providerName: provider.name,
          isEligible: false,
          ineligibleReason: ruleResult.reason,
          price: null,
          estimatedDeliveryDays: null,
          aiScore: 0,
          rank: 99,
          isRecommended: false,
        });
        continue;
      }

      // 2. Query specific provider adapter
      const adapter = this.adapters[provider.code.toLowerCase()];
      if (!adapter) {
        this.logger.warn(`No adapter found for provider code: ${provider.code}`);
        continue;
      }

      try {
        const rawQuote = await adapter.calculateQuote({
          senderCity: params.senderCity,
          receiverCity: params.receiverCity,
          width: params.width,
          height: params.height,
          length: params.length,
          desi,
          weight: params.weight,
        });

        // Collect stats for AI optimization service
        eligibleQuotesForAI.push({
          providerCode: provider.code,
          providerName: provider.name,
          price: rawQuote.price,
          deliveryDays: rawQuote.estimatedDeliveryDays,
          reliabilityScore: Number(provider.reliabilityScore),
          deliverySuccessRate: Number(provider.deliverySuccessRate),
        });

        comparisonResults.push({
          providerId: provider.id,
          providerCode: provider.code,
          providerName: provider.name,
          isEligible: true,
          price: rawQuote.price,
          estimatedDeliveryDays: rawQuote.estimatedDeliveryDays,
        });
      } catch (error) {
        this.logger.error(`Failed to retrieve quote for provider ${provider.name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // 3. Run AI Optimization Layer for eligible providers
    const optimizedList = await this.aiOptimizer.optimize({
      quotes: eligibleQuotesForAI,
      senderCity: params.senderCity,
      receiverCity: params.receiverCity,
      weight: params.weight,
      desi,
      merchantPreference: params.merchantPreference,
    });

    // 4. Merge AI scores, ranks, and recommendation flags back into results
    const finalizedQuotes = comparisonResults.map((item) => {
      if (!item.isEligible) return item;

      const aiMatch = optimizedList.find((opt) => opt.providerCode === item.providerCode);
      return {
        ...item,
        aiScore: aiMatch ? aiMatch.aiScore : 70.0,
        rank: aiMatch ? aiMatch.rank : 99,
        isRecommended: aiMatch ? aiMatch.isRecommended : false,
        explanation: aiMatch ? aiMatch.explanation : 'Standard option',
      };
    });

    // Sort by eligibility first, then by rank
    finalizedQuotes.sort((a, b) => {
      if (a.isEligible !== b.isEligible) {
        return a.isEligible ? -1 : 1;
      }
      return a.rank - b.rank;
    });

    // Estimate savings versus the worst eligible price option
    const eligiblePrices = finalizedQuotes.filter((q) => q.isEligible).map((q) => q.price);
    const worstPrice = eligiblePrices.length > 0 ? Math.max(...eligiblePrices) : 0;
    const bestPrice = eligiblePrices.length > 0 ? Math.min(...eligiblePrices) : 0;
    const estimatedSavings = Math.max(0, worstPrice - bestPrice);

    return {
      desi,
      weight: params.weight,
      senderCity: params.senderCity,
      receiverCity: params.receiverCity,
      estimatedSavings: Math.round(estimatedSavings * 100) / 100,
      quotes: finalizedQuotes,
    };
  }

  /**
   * Finalizes quotes, creates the shipment record in the database, attaches quotes,
   * starts tracking updates, and updates merchant shipping analytics.
   */
  async createShipment(userId: string, params: CreateShipmentParams) {
    const optimization = await this.getQuotesAndOptimize(userId, params);
    
    const selectedQuote = optimization.quotes.find(
      (q) => q.providerCode.toLowerCase() === params.selectedProviderCode.toLowerCase(),
    );

    if (!selectedQuote || !selectedQuote.isEligible) {
      throw new BadRequestException(`Selected provider ${params.selectedProviderCode} is not eligible or available for this package.`);
    }

    const eligibleQuotes = optimization.quotes.filter((q) => q.isEligible);
    const worstPrice = eligibleQuotes.length > 0 ? Math.max(...eligibleQuotes.map(q => q.price)) : selectedQuote.price;
    const savings = Math.max(0, worstPrice - selectedQuote.price);

    // Save shipment, quotes, tracking log and update analytics in a transaction
    return this.prisma.$transaction(async (tx) => {
      // 1. Create Shipment
      const shipment = await tx.shipment.create({
        data: {
          merchantId: userId,
          senderName: params.senderName,
          senderAddress: params.senderAddress,
          senderCity: params.senderCity,
          receiverName: params.receiverName,
          receiverAddress: params.receiverAddress,
          receiverCity: params.receiverCity,
          width: params.width,
          height: params.height,
          length: params.length,
          desi: optimization.desi,
          weight: params.weight,
          status: 'PENDING',
          selectedProviderId: selectedQuote.providerId,
          finalPrice: selectedQuote.price,
          estimatedDeliveryDays: selectedQuote.estimatedDeliveryDays,
        },
      });

      // 2. Save Quotes generated for this shipment
      await tx.shipmentQuote.createMany({
        data: optimization.quotes.map((q) => ({
          shipmentId: shipment.id,
          providerId: q.providerId,
          price: q.isEligible ? q.price : 0,
          estimatedDeliveryDays: q.isEligible ? q.estimatedDeliveryDays : 0,
          aiScore: q.aiScore,
          rank: q.rank,
          isRecommended: q.isRecommended,
        })),
      });

      // 3. Create initial tracking record
      await tx.shipmentTracking.create({
        data: {
          shipmentId: shipment.id,
          status: 'PENDING',
          location: `${params.senderCity} Hub`,
          description: 'Shipment registered. Awaiting carrier pickup from merchant location.',
        },
      });

      // 4. Update Merchant Shipping Analytics
      const currentAnalytics = await tx.shippingAnalytics.findUnique({
        where: { merchantId: userId },
      });

      if (currentAnalytics) {
        const nextTotalShipments = currentAnalytics.totalShipments + 1;
        const nextSpent = Number(currentAnalytics.totalSpent) + selectedQuote.price;
        const nextSaved = Number(currentAnalytics.totalSaved) + savings;
        
        // Calculate new running average for delivery speed
        const nextAvgDelivery =
          (Number(currentAnalytics.avgDeliveryTime) * currentAnalytics.totalShipments +
            selectedQuote.estimatedDeliveryDays) /
          nextTotalShipments;

        await tx.shippingAnalytics.update({
          where: { merchantId: userId },
          data: {
            totalShipments: nextTotalShipments,
            totalSpent: nextSpent,
            totalSaved: nextSaved,
            avgDeliveryTime: Math.round(nextAvgDelivery * 10) / 10,
          },
        });
      } else {
        await tx.shippingAnalytics.create({
          data: {
            merchantId: userId,
            totalShipments: 1,
            totalSpent: selectedQuote.price,
            totalSaved: savings,
            avgDeliveryTime: selectedQuote.estimatedDeliveryDays,
          },
        });
      }

      return tx.shipment.findUnique({
        where: { id: shipment.id },
        include: {
          selectedProvider: true,
          quotes: {
            include: { provider: true },
          },
          tracking: true,
        },
      });
    });
  }

  /**
   * Fetches shipment history for a specific merchant.
   */
  async getShipmentHistory(userId: string) {
    return this.prisma.shipment.findMany({
      where: { merchantId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        selectedProvider: true,
        quotes: {
          include: { provider: true },
        },
        tracking: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Fetches aggregated shipping analytics and savings for the dashboard.
   */
  async getShippingAnalytics(userId: string) {
    const analytics = await this.prisma.shippingAnalytics.findUnique({
      where: { merchantId: userId },
    });

    if (!analytics) {
      return {
        totalShipments: 0,
        totalSpent: 0,
        totalSaved: 0,
        avgDeliveryTime: 0,
        providerShares: [],
      };
    }

    // Calculate provider distribution share for analytics chart
    const shipmentsGrouped = await this.prisma.shipment.groupBy({
      by: ['selectedProviderId'],
      where: { merchantId: userId, NOT: { selectedProviderId: null } },
      _count: {
        id: true,
      },
    });

    const providers = await this.prisma.cargoProvider.findMany();

    const providerShares = shipmentsGrouped.map((group) => {
      const provider = providers.find((p) => p.id === group.selectedProviderId);
      return {
        providerName: provider ? provider.name : 'Unknown',
        count: group._count.id,
        percentage: Math.round((group._count.id / analytics.totalShipments) * 100),
      };
    });

    return {
      totalShipments: analytics.totalShipments,
      totalSpent: Number(analytics.totalSpent),
      totalSaved: Number(analytics.totalSaved),
      avgDeliveryTime: Number(analytics.avgDeliveryTime),
      providerShares,
    };
  }
}
