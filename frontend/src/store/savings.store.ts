import { create } from 'zustand';
import { savingsService, type SavingsDashboardData } from '@/src/services/savings.service';

interface SavingsState {
  dashboard: SavingsDashboardData | null;
  isLoading: boolean;
  isSeeding: boolean;
  error: string | null;

  loadDashboard: () => Promise<void>;
  seedMockHistory: () => Promise<void>;
  reset: () => void;
}

export const useSavingsStore = create<SavingsState>((set, get) => ({
  dashboard: null,
  isLoading: false,
  isSeeding: false,
  error: null,

  async loadDashboard() {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const dashboard = await savingsService.getDashboard();
      set({ dashboard });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to load savings dashboard' });
    } finally {
      set({ isLoading: false });
    }
  },

  async seedMockHistory() {
    if (get().isSeeding) return;
    set({ isSeeding: true, error: null });
    try {
      await savingsService.seedMock();
      // Reload dashboard stats after successful mock seeding
      const dashboard = await savingsService.getDashboard();
      set({ dashboard });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to generate mock savings' });
      throw e;
    } finally {
      set({ isSeeding: false });
    }
  },

  reset() {
    set({ dashboard: null, isLoading: false, isSeeding: false, error: null });
  },
}));
