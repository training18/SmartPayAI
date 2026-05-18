/**
 * OCR service — abstracts the card-recognition pipeline.
 *
 * In production this will call a vision API / native OCR module
 * (e.g. ML Kit, VisionCamera frame processors). The mock returns a
 * deterministic recognized card so the navigation flow is testable end
 * to end without a camera.
 */

import type { Card, OcrCardResult } from '@/src/types';

export const ocrService = {
  async scan(): Promise<OcrCardResult> {
    await new Promise((r) => setTimeout(r, 800));
    return {
      holderName: 'ALEXANDER W.',
      last4: '4421',
      network: 'mastercard',
      expiryMonth: 11,
      expiryYear: 29,
      bankName: 'Citi',
    };
  },

  toCard(result: OcrCardResult): Card {
    return {
      id: `card-${Date.now()}`,
      holderName: result.holderName,
      last4: result.last4,
      network: result.network,
      expiryMonth: result.expiryMonth,
      expiryYear: result.expiryYear,
      bankName: result.bankName,
      addedAt: new Date().toISOString(),
    };
  },
};
