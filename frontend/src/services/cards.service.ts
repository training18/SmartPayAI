/**
 * Cards service — encapsulates the data access for Personal user's wallet.
 *
 * Currently returns in-memory seed data; replace with REST / GraphQL calls
 * without touching the store or hooks.
 */

import type { Card, CardNetwork } from '@/src/types';

export interface ManualCardDraft {
  holderName: string;
  /** Raw 13–19 digit PAN as typed by the user; only last4 is persisted. */
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

const seedCards: Card[] = [
  {
    id: 'card-infinity',
    holderName: 'ALEXANDER W.',
    last4: '9824',
    network: 'visa',
    expiryMonth: 12,
    expiryYear: 28,
    bankName: 'Chase',
    nickname: 'Infinity Card',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'card-sapphire',
    holderName: 'ALEXANDER W.',
    last4: '3099',
    network: 'mastercard',
    expiryMonth: 8,
    expiryYear: 27,
    bankName: 'Chase',
    nickname: 'Sapphire',
    addedAt: new Date().toISOString(),
  },
];

export const cardsService = {
  async list(): Promise<Card[]> {
    await new Promise((r) => setTimeout(r, 150));
    return [...seedCards];
  },

  async save(card: Card): Promise<Card> {
    await new Promise((r) => setTimeout(r, 150));
    return card;
  },

  async remove(id: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 120));
    void id;
  },

  async update(id: string, patch: Partial<Card>): Promise<Partial<Card> & { id: string }> {
    await new Promise((r) => setTimeout(r, 120));
    return { id, ...patch };
  },

  /** Builds a persistable Card from a manual entry draft. */
  fromManual(draft: ManualCardDraft): Card {
    const digits = draft.pan.replace(/[^0-9]/g, '');
    return {
      id: `card-${Date.now()}`,
      holderName: draft.holderName.trim().toUpperCase(),
      last4: digits.slice(-4),
      network: detectNetwork(digits),
      expiryMonth: draft.expiryMonth,
      expiryYear: draft.expiryYear,
      bankName: draft.bankName?.trim() || undefined,
      nickname: draft.nickname?.trim() || undefined,
      addedAt: new Date().toISOString(),
    };
  },
};
