import { PrismaService } from '../prisma';
import { MerchantIntelligenceService } from '../ai/merchant-intelligence.service';
import { CardRecommendationService } from '../ai/card-recommendation.service';
import { VirtualCardsService } from '../virtual-cards/virtual-cards.service';
import { InitiateTransactionDto } from './dto';
import { Prisma } from '@prisma/client';
export declare class TransactionsService {
    private readonly prisma;
    private readonly merchantIntel;
    private readonly cardRecommendation;
    private readonly virtualCards;
    private readonly logger;
    constructor(prisma: PrismaService, merchantIntel: MerchantIntelligenceService, cardRecommendation: CardRecommendationService, virtualCards: VirtualCardsService);
    initiate(userId: string, dto: InitiateTransactionDto): Promise<{
        transaction: {
            id: string;
            merchantName: string;
            amount: number;
            currency: string;
            status: import("@prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
        };
        merchantAnalysis: {
            category: string;
            spendingType: string;
        };
        recommendation: {
            id: string;
            recommendedBank: string;
            recommendedCardId: string | null;
            recommendedNetwork: string | null;
            merchantCategory: string;
            reason: string;
            estimatedBenefit: string;
            confidence: number;
            cashbackEarned: number;
            discountAmount: number;
            pointsValue: number;
            installmentValue: number;
            aiRoutingGain: number;
            totalSavedAmount: number;
            savingsBreakdown: string | number | boolean | Prisma.JsonObject | Prisma.JsonArray | null;
            rejectedCards: string | number | boolean | Prisma.JsonObject | Prisma.JsonArray | null;
            campaignMatches: string | number | boolean | Prisma.JsonObject | Prisma.JsonArray | null;
        };
    }>;
    approve(userId: string, transactionId: string): Promise<{
        transaction: {
            id: string;
            merchantName: string;
            amount: number;
            currency: string;
            status: import("@prisma/client").$Enums.TransactionStatus;
            updatedAt: Date;
        };
        recommendation: {
            id: string;
            recommendedBank: string;
            recommendedCardId: string | null;
            recommendedNetwork: string | null;
            merchantCategory: string;
            reason: string;
            estimatedBenefit: string;
            confidence: number;
            cashbackEarned: number;
            discountAmount: number;
            pointsValue: number;
            installmentValue: number;
            aiRoutingGain: number;
            totalSavedAmount: number;
            savingsBreakdown: string | number | boolean | Prisma.JsonObject | Prisma.JsonArray | null;
            rejectedCards: string | number | boolean | Prisma.JsonObject | Prisma.JsonArray | null;
            campaignMatches: string | number | boolean | Prisma.JsonObject | Prisma.JsonArray | null;
        } | null;
        message: string;
    }>;
    reject(userId: string, transactionId: string): Promise<{
        transaction: {
            id: string;
            status: import("@prisma/client").$Enums.TransactionStatus;
            updatedAt: Date;
        };
        message: string;
    }>;
    findAllByUser(userId: string): Promise<{
        id: string;
        merchantName: string;
        amount: number;
        currency: string;
        status: import("@prisma/client").$Enums.TransactionStatus;
        description: string | null;
        createdAt: Date;
        recommendation: {
            id: string;
            recommendedBank: string;
            recommendedCardId: string | null;
            recommendedNetwork: string | null;
            merchantCategory: string;
            reason: string;
            estimatedBenefit: string;
            confidence: number;
            cashbackEarned: number;
            discountAmount: number;
            pointsValue: number;
            installmentValue: number;
            aiRoutingGain: number;
            totalSavedAmount: number;
            savingsBreakdown: string | number | boolean | Prisma.JsonObject | Prisma.JsonArray | null;
            rejectedCards: string | number | boolean | Prisma.JsonObject | Prisma.JsonArray | null;
            campaignMatches: string | number | boolean | Prisma.JsonObject | Prisma.JsonArray | null;
        } | null;
    }[]>;
    findById(userId: string, transactionId: string): Promise<{
        amount: number;
        recommendation: {
            id: string;
            recommendedBank: string;
            recommendedCardId: string | null;
            recommendedNetwork: string | null;
            merchantCategory: string;
            reason: string;
            estimatedBenefit: string;
            confidence: number;
            cashbackEarned: number;
            discountAmount: number;
            pointsValue: number;
            installmentValue: number;
            aiRoutingGain: number;
            totalSavedAmount: number;
            savingsBreakdown: string | number | boolean | Prisma.JsonObject | Prisma.JsonArray | null;
            rejectedCards: string | number | boolean | Prisma.JsonObject | Prisma.JsonArray | null;
            campaignMatches: string | number | boolean | Prisma.JsonObject | Prisma.JsonArray | null;
        } | null;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.TransactionStatus;
        userId: string;
        mcc: string | null;
        merchantId: string | null;
        merchantName: string;
        currency: string;
    }>;
    private serializeRecommendation;
    private getOwnedTransaction;
}
