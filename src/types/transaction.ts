/**
 * Personal-user transaction history types.
 *
 * Every transaction records the optimization decision so the UI can surface
 * "best card chosen" reasoning to the user.
 */

export type RewardKind = 'cashback' | 'points' | 'miles' | 'none';

export interface RewardOptimization {
  kind: RewardKind;
  /** Reward value in account currency (cashback) or absolute points/miles count. */
  value: number;
  /** Human-readable summary, e.g. "3x dining". */
  label: string;
}

export interface Transaction {
  id: string;
  cardId: string;
  merchant: string;
  category?: string;
  amount: number;
  currency: string;
  /** ISO timestamp the transaction was authorized. */
  occurredAt: string;
  reward: RewardOptimization;
}
