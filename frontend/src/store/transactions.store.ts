/**
 * Transactions store — Personal user's spending history.
 */

import { create } from 'zustand';

import { transactionsService } from '@/src/services/transactions.service';
import type { Transaction } from '@/src/types';

interface TransactionsState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  load: () => Promise<void>;
  reset: () => void;
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,

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

  reset() {
    set({ transactions: [], isLoading: false, error: null });
  },
}));
