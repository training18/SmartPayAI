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
var TransactionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../prisma");
const merchant_intelligence_service_1 = require("../ai/merchant-intelligence.service");
const card_recommendation_service_1 = require("../ai/card-recommendation.service");
const virtual_cards_service_1 = require("../virtual-cards/virtual-cards.service");
const client_1 = require("@prisma/client");
let TransactionsService = TransactionsService_1 = class TransactionsService {
    prisma;
    merchantIntel;
    cardRecommendation;
    virtualCards;
    logger = new common_1.Logger(TransactionsService_1.name);
    constructor(prisma, merchantIntel, cardRecommendation, virtualCards) {
        this.prisma = prisma;
        this.merchantIntel = merchantIntel;
        this.cardRecommendation = cardRecommendation;
        this.virtualCards = virtualCards;
    }
    async initiate(userId, dto) {
        const currency = dto.currency ?? 'TRY';
        const virtualCard = await this.virtualCards.getByUserId(userId);
        if (!virtualCard) {
            throw new common_1.BadRequestException('No virtual card found. Please contact support.');
        }
        if (Number(virtualCard.balance) < dto.amount) {
            throw new common_1.BadRequestException(`Insufficient virtual card balance. Available: ${virtualCard.balance} ${currency}`);
        }
        this.logger.log(`[Initiate] Analyzing merchant: ${dto.merchantName}`);
        const merchantAnalysis = await this.merchantIntel.analyze(dto.merchantName, dto.mcc);
        this.logger.log(`[Initiate] Generating recommendation for category: ${merchantAnalysis.merchantCategory}`);
        const recommendation = await this.cardRecommendation.recommend(userId, dto.merchantName, merchantAnalysis.merchantCategory, dto.amount, currency);
        const transaction = await this.prisma.transaction.create({
            data: {
                userId,
                merchantId: merchantAnalysis.merchantId,
                merchantName: dto.merchantName,
                amount: dto.amount,
                currency,
                description: dto.description,
                mcc: dto.mcc,
                status: client_1.TransactionStatus.PENDING,
            },
        });
        const rec = await this.prisma.recommendation.create({
            data: {
                transactionId: transaction.id,
                recommendedCardId: recommendation.recommendedCardId,
                merchantCategory: merchantAnalysis.merchantCategory,
                recommendedBank: recommendation.recommendedBank,
                recommendedNetwork: recommendation.recommendedNetwork,
                reason: recommendation.reason,
                estimatedBenefit: recommendation.estimatedBenefit,
                confidence: recommendation.confidence,
                cashbackEarned: recommendation.savings.cashbackEarned,
                discountAmount: recommendation.savings.discountAmount,
                pointsValue: recommendation.savings.pointsValue,
                installmentValue: 0,
                totalSavedAmount: recommendation.savings.totalSavedAmount,
                savingsBreakdown: (recommendation.routingPlan?.savingsBreakdown ??
                    null),
                rejectedCards: (recommendation.routingPlan?.rejectedCards ??
                    null),
                campaignMatches: (recommendation.routingPlan?.campaignMatches ??
                    null),
                aiRawResponse: recommendation,
            },
        });
        this.logger.log(`[Initiate] Transaction ${transaction.id} created (PENDING) — AI recommends: ${recommendation.recommendedBank}`);
        return {
            transaction: {
                id: transaction.id,
                merchantName: transaction.merchantName,
                amount: Number(transaction.amount),
                currency: transaction.currency,
                status: transaction.status,
                createdAt: transaction.createdAt,
            },
            merchantAnalysis: {
                category: merchantAnalysis.merchantCategory,
                spendingType: merchantAnalysis.spendingType,
            },
            recommendation: this.serializeRecommendation(rec),
        };
    }
    async approve(userId, transactionId) {
        const transaction = await this.getOwnedTransaction(userId, transactionId);
        if (transaction.status !== client_1.TransactionStatus.PENDING) {
            throw new common_1.BadRequestException(`Transaction is already ${transaction.status.toLowerCase()}`);
        }
        await this.virtualCards.deductBalance(userId, Number(transaction.amount));
        const updated = await this.prisma.transaction.update({
            where: { id: transactionId },
            data: { status: client_1.TransactionStatus.COMPLETED },
            include: { recommendation: true },
        });
        this.logger.log(`[Approve] Transaction ${transactionId} COMPLETED`);
        return {
            transaction: {
                id: updated.id,
                merchantName: updated.merchantName,
                amount: Number(updated.amount),
                currency: updated.currency,
                status: updated.status,
                updatedAt: updated.updatedAt,
            },
            recommendation: updated.recommendation
                ? this.serializeRecommendation(updated.recommendation)
                : null,
            message: 'Payment completed successfully!',
        };
    }
    async reject(userId, transactionId) {
        const transaction = await this.getOwnedTransaction(userId, transactionId);
        if (transaction.status !== client_1.TransactionStatus.PENDING) {
            throw new common_1.BadRequestException(`Transaction is already ${transaction.status.toLowerCase()}`);
        }
        const updated = await this.prisma.transaction.update({
            where: { id: transactionId },
            data: { status: client_1.TransactionStatus.REJECTED },
        });
        this.logger.log(`[Reject] Transaction ${transactionId} REJECTED`);
        return {
            transaction: {
                id: updated.id,
                status: updated.status,
                updatedAt: updated.updatedAt,
            },
            message: 'Transaction rejected.',
        };
    }
    async findAllByUser(userId) {
        const transactions = await this.prisma.transaction.findMany({
            where: { userId },
            include: { recommendation: true },
            orderBy: { createdAt: 'desc' },
        });
        return transactions.map((t) => ({
            id: t.id,
            merchantName: t.merchantName,
            amount: Number(t.amount),
            currency: t.currency,
            status: t.status,
            description: t.description,
            createdAt: t.createdAt,
            recommendation: t.recommendation
                ? this.serializeRecommendation(t.recommendation)
                : null,
        }));
    }
    async findById(userId, transactionId) {
        const transaction = await this.getOwnedTransaction(userId, transactionId);
        const rec = await this.prisma.recommendation.findUnique({
            where: { transactionId },
        });
        return {
            ...transaction,
            amount: Number(transaction.amount),
            recommendation: rec ? this.serializeRecommendation(rec) : null,
        };
    }
    serializeRecommendation(rec) {
        return {
            id: rec.id,
            recommendedBank: rec.recommendedBank,
            recommendedCardId: rec.recommendedCardId,
            recommendedNetwork: rec.recommendedNetwork,
            merchantCategory: rec.merchantCategory,
            reason: rec.reason,
            estimatedBenefit: rec.estimatedBenefit,
            confidence: Number(rec.confidence),
            cashbackEarned: Number(rec.cashbackEarned),
            discountAmount: Number(rec.discountAmount),
            pointsValue: Number(rec.pointsValue),
            installmentValue: Number(rec.installmentValue),
            aiRoutingGain: Number(rec.aiRoutingGain),
            totalSavedAmount: Number(rec.totalSavedAmount),
            savingsBreakdown: rec.savingsBreakdown ?? null,
            rejectedCards: rec.rejectedCards ?? null,
            campaignMatches: rec.campaignMatches ?? null,
        };
    }
    async getOwnedTransaction(userId, transactionId) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id: transactionId },
        });
        if (!transaction)
            throw new common_1.NotFoundException('Transaction not found');
        if (transaction.userId !== userId)
            throw new common_1.ForbiddenException('Not your transaction');
        return transaction;
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = TransactionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        merchant_intelligence_service_1.MerchantIntelligenceService,
        card_recommendation_service_1.CardRecommendationService,
        virtual_cards_service_1.VirtualCardsService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map