import { VirtualCardsService } from './virtual-cards.service';
import { JwtPayload } from '../common/types';
export declare class VirtualCardsController {
    private readonly virtualCards;
    constructor(virtualCards: VirtualCardsService);
    getMyCard(user: JwtPayload): Promise<{
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
}
