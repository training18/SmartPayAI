/**
 * Merchant & AI intelligence service.
 *
 * Endpoints:
 *   POST /ai/analyze-merchant    — AI-powered merchant analysis
 *   POST /ai/recommend-card      — AI-powered card recommendation
 *   GET  /campaigns              — list active bank campaigns
 *
 * The merchant analytics summary is now derived from real transaction data
 * rather than hardcoded seed data.
 */

import { apiClient } from './api-client';
import type { MerchantAnalyticsSummary, MerchantPayment } from '@/src/types';
import type { BackendTransaction } from '@/src/types/transaction';

// ── AI types ────────────────────────────────────────────────────────────────

/** Response from POST /ai/analyze-merchant. */
export interface MerchantAnalysisResult {
  merchantCategory: string;
  spendingType: string;
  confidence: number;
  reasoning: string;
  merchantId: string;
}

/** Response from POST /ai/recommend-card. */
export interface CardRecommendationResult {
  recommendedCardId: string | null;
  recommendedBank: string;
  reason: string;
  estimatedBenefit: string;
  confidence: number;
  rewardBreakdown?: {
    type: string;
    value: number;
    unit: string;
  };
}

/** Campaign from the backend. */
export interface Campaign {
  id: string;
  title: string;
  description: string;
  bankName: string;
  cardType: string | null;
  rewardType: string;
  category: string;
  rewardRate: number;
  minAmount: number | null;
  maxReward: number | null;
  isActive: boolean;
  startsAt: string;
  endsAt: string | null;
}

export const merchantService = {
  /**
   * AI-powered merchant analysis.
   * Determines merchant category and spending type.
   */
  async analyzeMerchant(merchantName: string, mcc?: string): Promise<MerchantAnalysisResult> {
    const { data } = await apiClient.post<MerchantAnalysisResult>('/ai/analyze-merchant', {
      merchantName,
      mcc,
    });
    return data;
  },

  /**
   * AI-powered card recommendation.
   * Evaluates user's cards against active campaigns for optimal payment.
   */
  async recommendCard(payload: {
    merchantName: string;
    merchantCategory: string;
    amount: number;
    currency?: string;
  }): Promise<CardRecommendationResult> {
    const { data } = await apiClient.post<CardRecommendationResult>('/ai/recommend-card', payload);
    return data;
  },

  /** List active bank campaigns with optional filters. */
  async getCampaigns(filters?: {
    category?: string;
    bankName?: string;
    cardType?: string;
  }): Promise<Campaign[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.bankName) params.append('bankName', filters.bankName);
    if (filters?.cardType) params.append('cardType', filters.cardType);

    const { data } = await apiClient.get<Campaign[]>(`/campaigns?${params.toString()}`);
    return data;
  },

  /**
   * Derive merchant payment analytics from transaction history.
   *
   * Since the backend doesn't have a dedicated merchant analytics endpoint,
   * we build the summary from the user's transaction list.
   */
  async listPayments(): Promise<MerchantPayment[]> {
    // For the merchant dashboard, we derive payments from real transactions.
    // This is a passthrough that the merchant store can process.
    const { data: transactions } = await apiClient.get<BackendTransaction[]>('/transactions');
    return transactions.map((t) => ({
      id: t.id,
      amount: t.amount,
      currency: t.currency,
      occurredAt: t.createdAt,
      candidates: [],
      routedProviderId: t.recommendation?.recommendedCardId ?? '',
      routingReason: t.recommendation?.reason ?? 'No recommendation available',
    }));
  },

  /** Build analytics summary from transaction data. */
  async getSummary(): Promise<MerchantAnalyticsSummary> {
    const payments = await this.listPayments();
    const totalVolume = payments.reduce((sum, p) => sum + p.amount, 0);
    return {
      totalVolume,
      totalCommissionPaid: 0,
      totalCommissionSaved: 0,
      transactionCount: payments.length,
      currency: payments[0]?.currency ?? 'TRY',
    };
  },
};
