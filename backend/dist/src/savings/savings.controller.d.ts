import { JwtPayload } from '../common/types';
import { SavingsService } from './savings.service';
export declare class SavingsController {
    private readonly savingsService;
    constructor(savingsService: SavingsService);
    getDashboard(user: JwtPayload): Promise<{
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
    seedMock(user: JwtPayload): Promise<{
        success: boolean;
        count: number;
    }>;
}
