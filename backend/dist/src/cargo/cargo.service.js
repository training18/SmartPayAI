"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CargoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CargoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../prisma");
const yurtici_adapter_1 = require("./providers/yurtici.adapter");
const mng_adapter_1 = require("./providers/mng.adapter");
const aras_adapter_1 = require("./providers/aras.adapter");
const cargo_rules_engine_1 = require("./engines/cargo-rules.engine");
const cargo_ai_optimization_service_1 = require("./engines/cargo-ai-optimization.service");
let CargoService = CargoService_1 = class CargoService {
    prisma;
    rulesEngine;
    aiOptimizer;
    logger = new common_1.Logger(CargoService_1.name);
    adapters;
    constructor(prisma, rulesEngine, aiOptimizer, yurtici, mng, aras) {
        this.prisma = prisma;
        this.rulesEngine = rulesEngine;
        this.aiOptimizer = aiOptimizer;
        this.adapters = {
            yurtici,
            mng,
            aras,
        };
    }
    calculateDesi(width, height, length) {
        return Math.round(((width * height * length) / 3000) * 100) / 100;
    }
    async getQuotesAndOptimize(userId, params) {
        const desi = this.calculateDesi(params.width, params.height, params.length);
        const dbProviders = await this.prisma.cargoProvider.findMany({
            where: { isActive: true },
        });
        if (dbProviders.length === 0) {
            throw new common_1.BadRequestException('No active cargo providers configured in the system.');
        }
        const eligibleQuotesForAI = [];
        const comparisonResults = [];
        for (const provider of dbProviders) {
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
            }
            catch (error) {
                this.logger.error(`Failed to retrieve quote for provider ${provider.name}: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        const optimizedList = await this.aiOptimizer.optimize({
            quotes: eligibleQuotesForAI,
            senderCity: params.senderCity,
            receiverCity: params.receiverCity,
            weight: params.weight,
            desi,
            merchantPreference: params.merchantPreference,
        });
        const finalizedQuotes = comparisonResults.map((item) => {
            if (!item.isEligible)
                return item;
            const aiMatch = optimizedList.find((opt) => opt.providerCode === item.providerCode);
            return {
                ...item,
                aiScore: aiMatch ? aiMatch.aiScore : 70.0,
                rank: aiMatch ? aiMatch.rank : 99,
                isRecommended: aiMatch ? aiMatch.isRecommended : false,
                explanation: aiMatch ? aiMatch.explanation : 'Standard option',
            };
        });
        finalizedQuotes.sort((a, b) => {
            if (a.isEligible !== b.isEligible) {
                return a.isEligible ? -1 : 1;
            }
            return a.rank - b.rank;
        });
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
    async createShipment(userId, params) {
        const optimization = await this.getQuotesAndOptimize(userId, params);
        const selectedQuote = optimization.quotes.find((q) => q.providerCode.toLowerCase() === params.selectedProviderCode.toLowerCase());
        if (!selectedQuote || !selectedQuote.isEligible) {
            throw new common_1.BadRequestException(`Selected provider ${params.selectedProviderCode} is not eligible or available for this package.`);
        }
        const eligibleQuotes = optimization.quotes.filter((q) => q.isEligible);
        const worstPrice = eligibleQuotes.length > 0 ? Math.max(...eligibleQuotes.map(q => q.price)) : selectedQuote.price;
        const savings = Math.max(0, worstPrice - selectedQuote.price);
        return this.prisma.$transaction(async (tx) => {
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
            await tx.shipmentTracking.create({
                data: {
                    shipmentId: shipment.id,
                    status: 'PENDING',
                    location: `${params.senderCity} Hub`,
                    description: 'Shipment registered. Awaiting carrier pickup from merchant location.',
                },
            });
            const currentAnalytics = await tx.shippingAnalytics.findUnique({
                where: { merchantId: userId },
            });
            if (currentAnalytics) {
                const nextTotalShipments = currentAnalytics.totalShipments + 1;
                const nextSpent = Number(currentAnalytics.totalSpent) + selectedQuote.price;
                const nextSaved = Number(currentAnalytics.totalSaved) + savings;
                const nextAvgDelivery = (Number(currentAnalytics.avgDeliveryTime) * currentAnalytics.totalShipments +
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
            }
            else {
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
    async getShipmentHistory(userId) {
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
    async getShippingAnalytics(userId) {
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
};
exports.CargoService = CargoService;
exports.CargoService = CargoService = CargoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        cargo_rules_engine_1.CargoRulesEngine,
        cargo_ai_optimization_service_1.CargoAiOptimizationService,
        yurtici_adapter_1.YurticiCargoAdapter,
        mng_adapter_1.MngCargoAdapter,
        aras_adapter_1.ArasCargoAdapter])
], CargoService);
//# sourceMappingURL=cargo.service.js.map