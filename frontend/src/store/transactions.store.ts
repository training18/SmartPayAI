/**
 * Transactions store — Personal user's payment history and AI flow state.
 *
 * Supports the full AI payment lifecycle:
 * 1. Initiate → AI recommendation (PENDING)
 * 2. Approve → deduct balance (COMPLETED)
 * 3. Reject → mark rejected
 */

import { create } from 'zustand';

import { transactionsService } from '@/src/services/transactions.service';
import type {
  BackendTransaction,
  InitiateTransactionPayload,
  TransactionInitiateResponse,
} from '@/src/types';

interface TransactionsState {
  transactions: BackendTransaction[];
  isLoading: boolean;
  error: string | null;

  /** Current AI recommendation from the most recent initiation. */
  pendingRecommendation: TransactionInitiateResponse | null;
  isInitiating: boolean;

  load: () => Promise<void>;
  getById: (id: string) => Promise<BackendTransaction>;
  initiate: (payload: InitiateTransactionPayload) => Promise<TransactionInitiateResponse>;
  approve: (id: string) => Promise<void>;
  reject: (id: string) => Promise<void>;
  clearPendingRecommendation: () => void;
  reset: () => void;
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,
  pendingRecommendation: null,
  isInitiating: false,

  async load() {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const transactions = await transactionsService.list();
      set({ transactions });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to load transactions' });
    } finally {
      set({ isLoading: false });
    }
  },

  async getById(id) {
    return transactionsService.getById(id);
  },

  async initiate(payload) {
    set({ isInitiating: true, error: null });
    try {
      const result = await transactionsService.initiate(payload);
      set({ pendingRecommendation: result });
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to initiate transaction';
      set({ error: msg });
      throw e;
    } finally {
      set({ isInitiating: false });
    }
  },

  async approve(id) {
    try {
      await transactionsService.approve(id);
      // Reload transactions to reflect updated status
      await get().load();
      set({ pendingRecommendation: null });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to approve transaction';
      set({ error: msg });
      throw e;
    }
  },

  async reject(id) {
    try {
      await transactionsService.reject(id);
      await get().load();
      set({ pendingRecommendation: null });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to reject transaction';
      set({ error: msg });
      throw e;
    }
  },

  clearPendingRecommendation() {
    set({ pendingRecommendation: null });
  },

  reset() {
    set({
      transactions: [],
      isLoading: false,
      error: null,
      pendingRecommendation: null,
      isInitiating: false,
    });
  },
}));
