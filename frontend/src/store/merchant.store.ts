/**
 * Merchant store — payment routing decisions and analytics summary.
 */

import { create } from 'zustand';

import { merchantService } from '@/src/services/merchant.service';
import type { MerchantAnalyticsSummary, MerchantPayment } from '@/src/types';

interface MerchantState {
  payments: MerchantPayment[];
  summary: MerchantAnalyticsSummary | null;
  isLoading: boolean;
  error: string | null;
  load: () => Promise<void>;
  reset: () => void;
}

export const useMerchantStore = create<MerchantState>((set, get) => ({
  payments: [],
  summary: null,
  isLoading: false,
  error: null,

  async load() {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const [payments, summary] = await Promise.all([
        merchantService.listPayments(),
        merchantService.getSummary(),
      ]);
      set({ payments, summary });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to load merchant data' });
    } finally {
      set({ isLoading: false });
    }
  },

  reset() {
    set({ payments: [], summary: null, isLoading: false, error: null });
  },
}));
