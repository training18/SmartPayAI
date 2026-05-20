import { apiClient } from './api-client';

export interface SavingsSummary {
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
}

export interface SavingsTrendPoint {
  label: string;
  amount: number;
}

export interface SavingsAnalyticsItem {
  name: string;
  amount: number;
}

export interface SavingsAnalytics {
  byMerchant: SavingsAnalyticsItem[];
  byCategory: SavingsAnalyticsItem[];
  byCard: SavingsAnalyticsItem[];
}

export interface SavingsHistoryItem {
  id: string;
  merchantName: string;
  amount: number;
  currency: string;
  date: string;
  totalSavedAmount: number;
  cashbackEarned: number;
  discountAmount: number;
  pointsValue: number;
  aiRoutingGain: number;
  recommendedBank: string;
  merchantCategory: string;
}

export interface SavingsDashboardData {
  summary: SavingsSummary;
  trends: SavingsTrendPoint[];
  analytics: SavingsAnalytics;
  history: SavingsHistoryItem[];
}

class SavingsService {
  async getDashboard(): Promise<SavingsDashboardData> {
    const response = await apiClient.get<SavingsDashboardData>('/savings/dashboard');
    return response.data;
  }

  async seedMock(): Promise<{ success: boolean; count: number }> {
    const response = await apiClient.post<{ success: boolean; count: number }>('/savings/seed-mock');
    return response.data;
  }
}

export const savingsService = new SavingsService();
