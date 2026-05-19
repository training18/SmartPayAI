/**
 * Cards service — encapsulates data access for saved cards.
 *
 * Endpoints:
 *   GET    /saved-cards      — list user's saved cards
 *   POST   /saved-cards      — add a new saved card
 *   PATCH  /saved-cards/:id  — update a saved card
 *   DELETE /saved-cards/:id  — remove a saved card
 */

import { apiClient } from './api-client';
import type {
  SavedCard,
  CreateSavedCardPayload,
  UpdateSavedCardPayload,
  Card,
  CardNetwork,
} from '@/src/types';

// ── Manual entry draft (kept for the add-card form) ─────────────────────────

export interface ManualCardDraft {
  holderName: string;
  /** Raw 13–19 digit PAN as typed by the user; only first4 (BIN) is persisted. */
  pan: string;
  /** Two-digit month (1–12) or zero-padded string accepted by the form. */
  expiryMonth: number;
  /** Two-digit year (e.g. 28 for 2028). */
  expiryYear: number;
  bankName?: string;
  nickname?: string;
}

/** Detects card network from the leading digits of a PAN. */
function detectNetwork(pan: string): CardNetwork {
  const digits = pan.replace(/[^0-9]/g, '');
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  if (/^(6011|65|64[4-9])/.test(digits)) return 'discover';
  return 'unknown';
}

export const cardsService = {
  /** List all saved cards for the current user. */
  async list(): Promise<SavedCard[]> {
    const { data } = await apiClient.get<SavedCard[]>('/saved-cards');
    return data;
  },

  /** Add a new saved card. */
  async save(payload: CreateSavedCardPayload): Promise<SavedCard> {
    const { data } = await apiClient.post<SavedCard>('/saved-cards', payload);
    return data;
  },

  /** Remove a saved card by ID. */
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/saved-cards/${id}`);
  },

  /** Update a saved card. */
  async update(id: string, patch: UpdateSavedCardPayload): Promise<SavedCard> {
    const { data } = await apiClient.patch<SavedCard>(`/saved-cards/${id}`, patch);
    return data;
  },

  /**
   * Builds a backend-compatible `CreateSavedCardPayload` from a manual entry draft.
   * Used by the add-card form to prepare the API request.
   */
  fromManual(draft: ManualCardDraft): CreateSavedCardPayload {
    const digits = draft.pan.replace(/[^0-9]/g, '');
    return {
      bankName: draft.bankName?.trim() || 'Unknown Bank',
      cardType: 'CREDIT',
      first4: digits.slice(0, 4),
      cardAlias: draft.nickname?.trim() || undefined,
      holderName: draft.holderName.trim().toUpperCase(),
      rewardType: 'NONE',
    };
  },

  /**
   * Legacy method — converts a ManualCardDraft to the old Card shape.
   * Used by existing UI components that haven't migrated to SavedCard yet.
   */
  fromManualLegacy(draft: ManualCardDraft): Card {
    const digits = draft.pan.replace(/[^0-9]/g, '');
    return {
      id: `card-${Date.now()}`,
      holderName: draft.holderName.trim().toUpperCase(),
      first4: digits.slice(0, 4),
      network: detectNetwork(digits),
      expiryMonth: draft.expiryMonth,
      expiryYear: draft.expiryYear,
      bankName: draft.bankName?.trim() || undefined,
      nickname: draft.nickname?.trim() || undefined,
      addedAt: new Date().toISOString(),
    };
  },
};
