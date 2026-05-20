import { PrismaService } from '../prisma';
import { ScoredCard } from '../ai/card-scoring.service';
export interface SavingsBreakdownResult {
    cashbackEarned: number;
    discountAmount: number;
    pointsValue: number;
    installmentValue: number;
    totalSavedAmount: number;
}
export declare class SavingsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    calculateSavings(amount: number, winnerCard: ScoredCard, allCards: ScoredCard[]): SavingsBreakdownResult;
    private computeSingleCardSavings;
    getSavingsDashboard(userId: string): Promise<{
        summary: {
            totalSaved: number;
            todaySaved: number;
            weeklySaved: number;
            monthlySaved: number;
            aiSmartRoutingGain: number;
            cashbackEarned: number;
            totalRewardsValue: number;
            bestPerformingCard: string;
            mostProfitableCampaign: string;
            aiOptimizationSuccessRate: number;
            estimatedAnnualSavingsProjection: number;
        };
        trends: {
            label: string;
            amount: number;
        }[];
        analytics: {
            byMerchant: {
                name: string;
                amount: number;
            }[];
            byCategory: {
                name: string;
                amount: number;
            }[];
            byCard: {
                name: string;
                amount: number;
            }[];
        };
        history: {
            id: string;
            merchantName: string;
            amount: number;
            currency: string;
            date: Date;
            totalSavedAmount: number;
            cashbackEarned: number;
            discountAmount: number;
            pointsValue: number;
            installmentValue: number;
            aiRoutingGain: number;
            recommendedBank: string;
            merchantCategory: string;
        }[];
    }>;
    seedMockData(userId: string): Promise<{
        success: boolean;
        count: number;
    }>;
}
