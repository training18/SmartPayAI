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
            reason: string;
            estimatedBenefit: string;
            confidence: number;
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
            recommendedBank: string;
            reason: string;
            estimatedBenefit: string;
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
            recommendedBank: string;
            merchantCategory: string;
            reason: string;
            estimatedBenefit: string;
            confidence: number;
        } | null;
    }[]>;
    findOne(user: JwtPayload, id: string): Promise<{
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
}
