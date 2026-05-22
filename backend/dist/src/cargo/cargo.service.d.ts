import { PrismaService } from '../prisma';
import { YurticiCargoAdapter } from './providers/yurtici.adapter';
import { MngCargoAdapter } from './providers/mng.adapter';
import { ArasCargoAdapter } from './providers/aras.adapter';
import { CargoRulesEngine } from './engines/cargo-rules.engine';
import { CargoAiOptimizationService } from './engines/cargo-ai-optimization.service';
export interface GetQuotesParams {
    senderName: string;
    senderAddress: string;
    senderCity: string;
    receiverName: string;
    receiverAddress: string;
    receiverCity: string;
    width: number;
    height: number;
    length: number;
    weight: number;
    merchantPreference?: string;
}
export interface CreateShipmentParams extends GetQuotesParams {
    selectedProviderCode: string;
}
export declare class CargoService {
    private readonly prisma;
    private readonly rulesEngine;
    private readonly aiOptimizer;
    private readonly logger;
    private readonly adapters;
    constructor(prisma: PrismaService, rulesEngine: CargoRulesEngine, aiOptimizer: CargoAiOptimizationService, yurtici: YurticiCargoAdapter, mng: MngCargoAdapter, aras: ArasCargoAdapter);
    calculateDesi(width: number, height: number, length: number): number;
    getQuotesAndOptimize(userId: string, params: GetQuotesParams): Promise<{
        desi: number;
        weight: number;
        senderCity: string;
        receiverCity: string;
        estimatedSavings: number;
        quotes: any[];
    }>;
    createShipment(userId: string, params: CreateShipmentParams): Promise<({
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
    getShipmentHistory(userId: string): Promise<({
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
    getShippingAnalytics(userId: string): Promise<{
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
