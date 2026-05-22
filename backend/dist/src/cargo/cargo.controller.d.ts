import { CargoService } from './cargo.service';
import { GetQuotesDto, CreateShipmentDto } from './dto/cargo.dto';
import { JwtPayload } from '../common/types';
export declare class CargoController {
    private readonly cargoService;
    constructor(cargoService: CargoService);
    getQuotes(user: JwtPayload, dto: GetQuotesDto): Promise<{
        desi: number;
        weight: number;
        senderCity: string;
        receiverCity: string;
        estimatedSavings: number;
        quotes: any[];
    }>;
    optimize(user: JwtPayload, dto: GetQuotesDto): Promise<{
        desi: number;
        weight: number;
        senderCity: string;
        receiverCity: string;
        estimatedSavings: number;
        quotes: any[];
    }>;
    createShipment(user: JwtPayload, dto: CreateShipmentDto): Promise<({
        quotes: ({
            provider: {
                name: string;
                id: string;
                code: string;
                baseRate: import("@prisma/client-runtime-utils").Decimal;
                perKgRate: import("@prisma/client-runtime-utils").Decimal;
                perDesiRate: import("@prisma/client-runtime-utils").Decimal;
                reliabilityScore: import("@prisma/client-runtime-utils").Decimal;
                deliverySuccessRate: import("@prisma/client-runtime-utils").Decimal;
                avgDeliveryDays: import("@prisma/client-runtime-utils").Decimal;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            estimatedDeliveryDays: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            shipmentId: string;
            providerId: string;
            aiScore: import("@prisma/client-runtime-utils").Decimal;
            rank: number;
            isRecommended: boolean;
        })[];
        selectedProvider: {
            name: string;
            id: string;
            code: string;
            baseRate: import("@prisma/client-runtime-utils").Decimal;
            perKgRate: import("@prisma/client-runtime-utils").Decimal;
            perDesiRate: import("@prisma/client-runtime-utils").Decimal;
            reliabilityScore: import("@prisma/client-runtime-utils").Decimal;
            deliverySuccessRate: import("@prisma/client-runtime-utils").Decimal;
            avgDeliveryDays: import("@prisma/client-runtime-utils").Decimal;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        tracking: {
            description: string;
            id: string;
            createdAt: Date;
            status: string;
            location: string;
            shipmentId: string;
        }[];
    } & {
        length: import("@prisma/client-runtime-utils").Decimal;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        merchantId: string;
        estimatedDeliveryDays: number | null;
        receiverCity: string;
        senderName: string;
        senderAddress: string;
        senderCity: string;
        receiverName: string;
        receiverAddress: string;
        width: import("@prisma/client-runtime-utils").Decimal;
        height: import("@prisma/client-runtime-utils").Decimal;
        desi: import("@prisma/client-runtime-utils").Decimal;
        weight: import("@prisma/client-runtime-utils").Decimal;
        selectedProviderId: string | null;
        finalPrice: import("@prisma/client-runtime-utils").Decimal | null;
    }) | null>;
    getHistory(user: JwtPayload): Promise<({
        quotes: ({
            provider: {
                name: string;
                id: string;
                code: string;
                baseRate: import("@prisma/client-runtime-utils").Decimal;
                perKgRate: import("@prisma/client-runtime-utils").Decimal;
                perDesiRate: import("@prisma/client-runtime-utils").Decimal;
                reliabilityScore: import("@prisma/client-runtime-utils").Decimal;
                deliverySuccessRate: import("@prisma/client-runtime-utils").Decimal;
                avgDeliveryDays: import("@prisma/client-runtime-utils").Decimal;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            estimatedDeliveryDays: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            shipmentId: string;
            providerId: string;
            aiScore: import("@prisma/client-runtime-utils").Decimal;
            rank: number;
            isRecommended: boolean;
        })[];
        selectedProvider: {
            name: string;
            id: string;
            code: string;
            baseRate: import("@prisma/client-runtime-utils").Decimal;
            perKgRate: import("@prisma/client-runtime-utils").Decimal;
            perDesiRate: import("@prisma/client-runtime-utils").Decimal;
            reliabilityScore: import("@prisma/client-runtime-utils").Decimal;
            deliverySuccessRate: import("@prisma/client-runtime-utils").Decimal;
            avgDeliveryDays: import("@prisma/client-runtime-utils").Decimal;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        tracking: {
            description: string;
            id: string;
            createdAt: Date;
            status: string;
            location: string;
            shipmentId: string;
        }[];
    } & {
        length: import("@prisma/client-runtime-utils").Decimal;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        merchantId: string;
        estimatedDeliveryDays: number | null;
        receiverCity: string;
        senderName: string;
        senderAddress: string;
        senderCity: string;
        receiverName: string;
        receiverAddress: string;
        width: import("@prisma/client-runtime-utils").Decimal;
        height: import("@prisma/client-runtime-utils").Decimal;
        desi: import("@prisma/client-runtime-utils").Decimal;
        weight: import("@prisma/client-runtime-utils").Decimal;
        selectedProviderId: string | null;
        finalPrice: import("@prisma/client-runtime-utils").Decimal | null;
    })[]>;
    getSavings(user: JwtPayload): Promise<{
        totalShipments: number;
        totalSpent: number;
        totalSaved: number;
        avgDeliveryTime: number;
        providerShares: {
            providerName: string;
            count: number;
            percentage: number;
        }[];
    }>;
}
