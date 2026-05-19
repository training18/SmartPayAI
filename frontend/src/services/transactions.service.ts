/**
 * Personal-user transaction history service.
 */

import type { Transaction } from '@/src/types';

const seed: Transaction[] = [
  {
    id: 'tx-001',
    cardId: 'card-infinity',
    merchant: 'Bistro En Lumière',
    category: 'dining',
    amount: 124.5,
    currency: 'USD',
    occurredAt: new Date().toISOString(),
    reward: { kind: 'points', value: 374, label: '3x Dining' },
  },
  {
    id: 'tx-002',
    cardId: 'card-sapphire',
    merchant: 'Shell Station',
    category: 'fuel',
    amount: 45,
    currency: 'USD',
    occurredAt: new Date().toISOString(),
    reward: { kind: 'cashback', value: 2.25, label: '5x Gas' },
  },
  {
    id: 'tx-003',
    cardId: 'card-infinity',
    merchant: 'Delta Airlines',
    category: 'travel',
    amount: 450,
    currency: 'USD',
    occurredAt: new Date().toISOString(),
    reward: { kind: 'miles', value: 2250, label: '5x Travel' },
  },
];

export const transactionsService = {
  async list(): Promise<Transaction[]> {
    await new Promise((r) => setTimeout(r, 150));
    return [...seed];
  },
};
