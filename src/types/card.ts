/**
 * Card-related domain types.
 *
 * `Card` represents a card saved by a Personal user — either scanned via
 * the OCR flow or imported through another channel.
 */

export type CardNetwork = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';

export interface Card {
  id: string;
  holderName: string;
  /** Last 4 digits only — full PANs must never be persisted in app storage. */
  last4: string;
  network: CardNetwork;
  expiryMonth: number;
  expiryYear: number;
  bankName?: string;
  nickname?: string;
  /** ISO timestamp the card was added to the wallet. */
  addedAt: string;
}

export interface OcrCardResult {
  holderName: string;
  last4: string;
  network: CardNetwork;
  expiryMonth: number;
  expiryYear: number;
  bankName?: string;
}
