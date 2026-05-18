/**
 * Cards store — Personal user's wallet state.
 */

import { create } from 'zustand';

import { cardsService } from '@/src/services/cards.service';
import type { Card } from '@/src/types';

interface CardsState {
  cards: Card[];
  isLoading: boolean;
  error: string | null;

  load: () => Promise<void>;
  add: (card: Card) => Promise<void>;
  remove: (id: string) => Promise<void>;
  update: (id: string, patch: Partial<Card>) => Promise<void>;
  reset: () => void;
}

export const useCardsStore = create<CardsState>((set, get) => ({
  cards: [],
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

  async add(card) {
    const saved = await cardsService.save(card);
    set((s) => ({ cards: [saved, ...s.cards] }));
  },

  async remove(id) {
    await cardsService.remove(id);
    set((s) => ({ cards: s.cards.filter((c) => c.id !== id) }));
  },

  async update(id, patch) {
    await cardsService.update(id, patch);
    set((s) => ({
      cards: s.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  },

  reset() {
    set({ cards: [], isLoading: false, error: null });
  },
}));
