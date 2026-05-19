/**
 * Cards store — Personal user's wallet state.
 *
 * Manages both saved cards (real bank cards) and the virtual card (demo).
 * Connected to backend via cards.service and virtual-card.service.
 */

import { create } from 'zustand';

import { cardsService } from '@/src/services/cards.service';
import { virtualCardService } from '@/src/services/virtual-card.service';
import type { SavedCard, VirtualCard, CreateSavedCardPayload, UpdateSavedCardPayload } from '@/src/types';

interface CardsState {
  cards: SavedCard[];
  virtualCard: VirtualCard | null;
  isLoading: boolean;
  error: string | null;

  load: () => Promise<void>;
  loadVirtualCard: () => Promise<void>;
  add: (payload: CreateSavedCardPayload) => Promise<SavedCard>;
  remove: (id: string) => Promise<void>;
  update: (id: string, patch: UpdateSavedCardPayload) => Promise<void>;
  reset: () => void;
}

export const useCardsStore = create<CardsState>((set, get) => ({
  cards: [],
  virtualCard: null,
  isLoading: false,
  error: null,

  async load() {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const cards = await cardsService.list();
      set({ cards });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to load cards' });
    } finally {
      set({ isLoading: false });
    }
  },

  async loadVirtualCard() {
    try {
      const virtualCard = await virtualCardService.getMyCard();
      set({ virtualCard });
    } catch (e) {
      console.warn('[cards] failed to load virtual card:', e);
    }
  },

  async add(payload) {
    const saved = await cardsService.save(payload);
    set((s) => ({ cards: [saved, ...s.cards] }));
    return saved;
  },

  async remove(id) {
    await cardsService.remove(id);
    set((s) => ({ cards: s.cards.filter((c) => c.id !== id) }));
  },

  async update(id, patch) {
    const updated = await cardsService.update(id, patch);
    set((s) => ({
      cards: s.cards.map((c) => (c.id === id ? updated : c)),
    }));
  },

  reset() {
    set({ cards: [], virtualCard: null, isLoading: false, error: null });
  },
}));
