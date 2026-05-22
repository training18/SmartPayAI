import { PrismaService } from '../prisma';
export declare class VirtualCardsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createForUser(userId: string, holderName: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        cardNumber: string;
        expiryMonth: number;
        expiryYear: number;
        cvv: string;
        cardHolder: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        provider: string;
        status: import("@prisma/client").$Enums.VirtualCardStatus;
        userId: string;
    }>;
    getByUserId(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        cardNumber: string;
        expiryMonth: number;
        expiryYear: number;
        cvv: string;
        cardHolder: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        provider: string;
        status: import("@prisma/client").$Enums.VirtualCardStatus;
        userId: string;
    } | null>;
    deductBalance(userId: string, amount: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        cardNumber: string;
        expiryMonth: number;
        expiryYear: number;
        cvv: string;
        cardHolder: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        provider: string;
        status: import("@prisma/client").$Enums.VirtualCardStatus;
        userId: string;
    }>;
    private generateCardNumber;
    private luhnCheckDigit;
    private generateCvv;
}
