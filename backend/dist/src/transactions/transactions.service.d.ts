import { PrismaService } from '../prisma';
import { MerchantIntelligenceService } from '../ai/merchant-intelligence.service';
import { CardRecommendationService } from '../ai/card-recommendation.service';
import { VirtualCardsService } from '../virtual-cards/virtual-cards.service';
import { InitiateTransactionDto } from './dto';
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
            reason: string;
            estimatedBenefit: string;
            confidence: number;
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
            recommendedBank: string;
            reason: string;
            estimatedBenefit: string;
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
            recommendedBank: string;
            merchantCategory: string;
            reason: string;
            estimatedBenefit: string;
            confidence: number;
        } | null;
    }[]>;
    findById(userId: string, transactionId: string): Promise<{
        amount: number;
        recommendation: {
            id: string;
            recommendedBank: string;
            recommendedCardId: string | null;
            merchantCategory: string;
            reason: string;
            estimatedBenefit: string;
            confidence: number;
        } | null;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.TransactionStatus;
        userId: string;
        mcc: string | null;
        merchantName: string;
        currency: string;
        merchantId: string | null;
    }>;
    private getOwnedTransaction;
}
