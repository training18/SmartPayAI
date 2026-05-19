/**
 * Card-related domain types.
 *
 * Two distinct card concepts:
 * - `SavedCard` — user's real bank cards stored in the backend
 * - `VirtualCard` — demo virtual card auto-created on registration
 *
 * The legacy `Card` type is kept as an alias for backward compatibility
 * with existing UI components until they're fully migrated.
 */

import type { BackendCardType, BackendRewardType, BackendVirtualCardStatus } from './api';

// ── Saved Cards (backend-aligned) ───────────────────────────────────────────

/** A user's saved bank card as returned by the backend. */
export interface SavedCard {
  id: string;
  userId: string;
  bankName: string;
  cardType: BackendCardType;
  /** First 4 digits (BIN prefix) — used to derive the card network. */
  first4: string;
  cardAlias?: string | null;
  holderName?: string | null;
  monthlyLimit?: number | null;
  rewardType: BackendRewardType;
  createdAt: string;
  updatedAt: string;
}

/** Payload for `POST /saved-cards`. */
export interface CreateSavedCardPayload {
  bankName: string;
  cardType: BackendCardType;
  /** First 4 digits (BIN prefix). */
  first4: string;
  cardAlias?: string;
  holderName?: string;
  monthlyLimit?: number;
  rewardType?: BackendRewardType;
}

/** Payload for `PATCH /saved-cards/:id`. */
export type UpdateSavedCardPayload = Partial<CreateSavedCardPayload>;

// ── Virtual Cards (backend-aligned) ─────────────────────────────────────────

/** Demo virtual card as returned by the backend. */
export interface VirtualCard {
  id: string;
  userId: string;
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  cardHolder: string;
  balance: number;
  provider: string;
  status: BackendVirtualCardStatus;
  createdAt: string;
  updatedAt: string;
}

// ── Legacy types (backward compat for existing screens) ─────────────────────

export type CardNetwork = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';

/**
 * Legacy Card type used by existing UI components.
 * New code should use `SavedCard` instead.
 */
export interface Card {
  id: string;
  holderName: string;
  /** First 4 digits (BIN prefix) — full PANs must never be persisted in app storage. */
  first4: string;
  network: CardNetwork;
  expiryMonth: number;
  expiryYear: number;
  bankName?: string;
  nickname?: string;
  /** ISO timestamp the card was added to the wallet. */
  addedAt: string;
}

/** Convert a SavedCard to the legacy Card shape for existing UI components. */
export function savedCardToLegacy(sc: SavedCard): Card {
  // Infer network from bank name heuristic or default to visa
  const network: CardNetwork = 'visa';
  return {
    id: sc.id,
    holderName: sc.holderName ?? sc.cardAlias ?? sc.bankName,
    first4: sc.first4,
    network,
    expiryMonth: 0,
    expiryYear: 0,
    bankName: sc.bankName,
    nickname: sc.cardAlias ?? undefined,
    addedAt: sc.createdAt,
  };
}
