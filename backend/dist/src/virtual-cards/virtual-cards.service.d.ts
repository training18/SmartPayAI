import { PrismaService } from '../prisma';
export declare class VirtualCardsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createForUser(userId: string, holderName: string): Promise<{
        id: string;
        cardNumber: string;
        expiryMonth: number;
        expiryYear: number;
        cvv: string;
        cardHolder: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        provider: string;
        status: import("@prisma/client").$Enums.VirtualCardStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    getByUserId(userId: string): Promise<{
        id: string;
        cardNumber: string;
        expiryMonth: number;
        expiryYear: number;
        cvv: string;
        cardHolder: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        provider: string;
        status: import("@prisma/client").$Enums.VirtualCardStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    } | null>;
    deductBalance(userId: string, amount: number): Promise<{
        id: string;
        cardNumber: string;
        expiryMonth: number;
        expiryYear: number;
        cvv: string;
        cardHolder: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        provider: string;
        status: import("@prisma/client").$Enums.VirtualCardStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    private generateCardNumber;
    private luhnCheckDigit;
    private generateCvv;
}
