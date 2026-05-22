import { create } from 'zustand';
import { cargoService, CargoQuoteInput, CreateShipmentInput, OptimizationResponse, Shipment, CargoAnalytics } from '../services/cargo.service';

interface CargoState {
  shipments: Shipment[];
  analytics: CargoAnalytics | null;
  activeOptimization: OptimizationResponse | null;
  isLoading: boolean;
  error: string | null;

  loadHistory: () => Promise<void>;
  loadAnalytics: () => Promise<void>;
  fetchQuotes: (input: CargoQuoteInput) => Promise<OptimizationResponse>;
  createShipment: (input: CreateShipmentInput) => Promise<Shipment>;
  clearOptimization: () => void;
  reset: () => void;
}

export const useCargoStore = create<CargoState>((set, get) => ({
  shipments: [],
  analytics: null,
  activeOptimization: null,
  isLoading: false,
  error: null,

  async loadHistory() {
    set({ isLoading: true, error: null });
    try {
      const shipments = await cargoService.getHistory();
      set({ shipments });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to fetch shipment history' });
    } finally {
      set({ isLoading: false });
    }
  },

  async loadAnalytics() {
    set({ isLoading: true, error: null });
    try {
      const analytics = await cargoService.getAnalytics();
      set({ analytics });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to fetch shipping analytics' });
    } finally {
      set({ isLoading: false });
    }
  },

  async fetchQuotes(input: CargoQuoteInput) {
    set({ isLoading: true, error: null, activeOptimization: null });
    try {
      const result = await cargoService.getQuotes(input);
      set({ activeOptimization: result });
      return result;
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Failed to fetch cargo quotes';
      set({ error: errMsg });
      throw new Error(errMsg);
    } finally {
      set({ isLoading: false });
    }
  },

  async createShipment(input: CreateShipmentInput) {
    set({ isLoading: true, error: null });
    try {
      const shipment = await cargoService.createShipment(input);
      // Reload history and analytics in background
      get().loadHistory();
      get().loadAnalytics();
      set({ activeOptimization: null });
      return shipment;
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Failed to create shipment';
      set({ error: errMsg });
      throw new Error(errMsg);
    } finally {
      set({ isLoading: false });
    }
  },

  clearOptimization() {
    set({ activeOptimization: null });
  },

  reset() {
    set({ shipments: [], analytics: null, activeOptimization: null, isLoading: false, error: null });
  },
}));
