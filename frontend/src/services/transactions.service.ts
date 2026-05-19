/**
 * Transactions service — manages the full payment lifecycle.
 *
 * Endpoints:
 *   POST /transactions/initiate     — AI-powered payment initiation
 *   POST /transactions/:id/approve  — approve a pending transaction
 *   POST /transactions/:id/reject   — reject a pending transaction
 *   GET  /transactions              — list user's transactions
 *   GET  /transactions/:id          — get transaction detail
 */

import { apiClient } from './api-client';
import type {
  BackendTransaction,
  InitiateTransactionPayload,
  TransactionInitiateResponse,
  TransactionApproveResponse,
  TransactionRejectResponse,
} from '@/src/types';

export const transactionsService = {
  /** List all transactions for the current user. */
  async list(): Promise<BackendTransaction[]> {
    const { data } = await apiClient.get<BackendTransaction[]>('/transactions');
    return data;
  },

  /** Get transaction detail with recommendation. */
  async getById(id: string): Promise<BackendTransaction> {
    const { data } = await apiClient.get<BackendTransaction>(`/transactions/${id}`);
    return data;
  },

  /**
   * Initiate a payment — AI analyzes the merchant and recommends the best card.
   *
   * Flow:
   * 1. Frontend sends merchant name + amount
   * 2. Backend AI analyzes merchant category and active campaigns
   * 3. Returns a PENDING transaction with AI recommendation
   * 4. User can then approve or reject
   */
  async initiate(payload: InitiateTransactionPayload): Promise<TransactionInitiateResponse> {
    const { data } = await apiClient.post<TransactionInitiateResponse>(
      '/transactions/initiate',
      payload,
    );
    return data;
  },

  /** Approve a pending transaction — deducts virtual card balance. */
  async approve(id: string): Promise<TransactionApproveResponse> {
    const { data } = await apiClient.post<TransactionApproveResponse>(
      `/transactions/${id}/approve`,
    );
    return data;
  },

  /** Reject a pending transaction. */
  async reject(id: string): Promise<TransactionRejectResponse> {
    const { data } = await apiClient.post<TransactionRejectResponse>(
      `/transactions/${id}/reject`,
    );
    return data;
  },
};
