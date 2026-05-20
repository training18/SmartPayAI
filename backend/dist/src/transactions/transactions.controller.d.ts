import { TransactionsService } from './transactions.service';
import { InitiateTransactionDto } from './dto';
import { JwtPayload } from '../common/types';
export declare class TransactionsController {
    private readonly transactions;
    constructor(transactions: TransactionsService);
    initiate(user: JwtPayload, dto: InitiateTransactionDto): Promise<{
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
            savingsBreakdown: string | number | boolean | import("@prisma/client/runtime/client").JsonObject | import("@prisma/client/runtime/client").JsonArray | null;
            rejectedCards: string | number | boolean | import("@prisma/client/runtime/client").JsonObject | import("@prisma/client/runtime/client").JsonArray | null;
            campaignMatches: string | number | boolean | import("@prisma/client/runtime/client").JsonObject | import("@prisma/client/runtime/client").JsonArray | null;
        };
    }>;
    approve(user: JwtPayload, id: string): Promise<{
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
            savingsBreakdown: string | number | boolean | import("@prisma/client/runtime/client").JsonObject | import("@prisma/client/runtime/client").JsonArray | null;
            rejectedCards: string | number | boolean | import("@prisma/client/runtime/client").JsonObject | import("@prisma/client/runtime/client").JsonArray | null;
            campaignMatches: string | number | boolean | import("@prisma/client/runtime/client").JsonObject | import("@prisma/client/runtime/client").JsonArray | null;
        } | null;
        message: string;
    }>;
    reject(user: JwtPayload, id: string): Promise<{
        transaction: {
            id: string;
            status: import("@prisma/client").$Enums.TransactionStatus;
            updatedAt: Date;
        };
        message: string;
    }>;
    findAll(user: JwtPayload): Promise<{
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
            savingsBreakdown: string | number | boolean | import("@prisma/client/runtime/client").JsonObject | import("@prisma/client/runtime/client").JsonArray | null;
            rejectedCards: string | number | boolean | import("@prisma/client/runtime/client").JsonObject | import("@prisma/client/runtime/client").JsonArray | null;
            campaignMatches: string | number | boolean | import("@prisma/client/runtime/client").JsonObject | import("@prisma/client/runtime/client").JsonArray | null;
        } | null;
    }[]>;
    findOne(user: JwtPayload, id: string): Promise<{
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
            savingsBreakdown: string | number | boolean | import("@prisma/client/runtime/client").JsonObject | import("@prisma/client/runtime/client").JsonArray | null;
            rejectedCards: string | number | boolean | import("@prisma/client/runtime/client").JsonObject | import("@prisma/client/runtime/client").JsonArray | null;
            campaignMatches: string | number | boolean | import("@prisma/client/runtime/client").JsonObject | import("@prisma/client/runtime/client").JsonArray | null;
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
}
