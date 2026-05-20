/**
 * Transaction and AI recommendation types.
 *
 * Aligned with backend Prisma models and the transaction controller
 * response shapes. The AI recommendation is embedded in both the
 * initiate response and the transaction list/detail responses.
 */

import type { BackendTransactionStatus } from './api';

// ── AI Recommendation ───────────────────────────────────────────────────────

/** Structured savings figure produced by the routing-simulation layer. */
export interface SavingsBreakdown {
  type: string;
  value: number;
  unit: string;
}

/** Per-card rejection reason emitted by the AI orchestrator. */
export interface RejectedCardEntry {
  cardId: string;
  bankName: string;
  network: string;
  reason: string;
  forfeitedValue: number;
  forfeitedUnit: string;
}

/** Campaign that actually applied to the winning card. */
export interface CampaignMatchEntry {
  campaignId: string;
  title: string;
  bankName: string;
  rewardRate: number;
  rewardValue: number;
  rewardUnit: string;
}

/** AI recommendation attached to a transaction. */
export interface Recommendation {
  id?: string;
  recommendedBank: string;
  recommendedCardId?: string | null;
  recommendedNetwork?: string | null;
  merchantCategory?: string;
  reason: string;
  estimatedBenefit: string;
  confidence: number;
  savingsBreakdown?: SavingsBreakdown | null;
  rejectedCards?: RejectedCardEntry[] | null;
  campaignMatches?: CampaignMatchEntry[] | null;
  cashbackEarned?: number;
  discountAmount?: number;
  pointsValue?: number;
  installmentValue?: number;
  aiRoutingGain?: number;
  totalSavedAmount?: number;
}

/** Merchant analysis result from AI. */
export interface MerchantAnalysis {
  category: string;
  spendingType: string;
}

// ── Transaction (backend-aligned) ───────────────────────────────────────────

/** Transaction as returned by `GET /transactions`. */
export interface BackendTransaction {
  id: string;
  merchantName: string;
  amount: number;
  currency: string;
  status: BackendTransactionStatus;
  description?: string | null;
  createdAt: string;
  updatedAt?: string;
  recommendation: Recommendation | null;
}

/** Payload for `POST /transactions/initiate`. */
export interface InitiateTransactionPayload {
  merchantName: string;
  amount: number;
  mcc?: string;
  description?: string;
  currency?: string;
}

/** Response from `POST /transactions/initiate`. */
export interface TransactionInitiateResponse {
  transaction: {
    id: string;
    merchantName: string;
    amount: number;
    currency: string;
    status: BackendTransactionStatus;
    createdAt: string;
  };
  merchantAnalysis: MerchantAnalysis;
  recommendation: Recommendation;
}

/** Response from `POST /transactions/:id/approve`. */
export interface TransactionApproveResponse {
  transaction: {
    id: string;
    merchantName: string;
    amount: number;
    currency: string;
    status: BackendTransactionStatus;
    updatedAt: string;
  };
  recommendation: Recommendation | null;
  message: string;
}

/** Response from `POST /transactions/:id/reject`. */
export interface TransactionRejectResponse {
  transaction: {
    id: string;
    status: BackendTransactionStatus;
    updatedAt: string;
  };
  message: string;
}

// ── Legacy types (backward compat for existing screens) ─────────────────────

export type RewardKind = 'cashback' | 'points' | 'miles' | 'none';

export interface RewardOptimization {
  kind: RewardKind;
  /** Reward value in account currency (cashback) or absolute points/miles count. */
  value: number;
  /** Human-readable summary, e.g. "3x dining". */
  label: string;
}

/**
 * Legacy Transaction type used by existing list screens.
 * New code should use `BackendTransaction` instead.
 */
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

/** Convert a BackendTransaction to the legacy Transaction shape. */
export function backendTxToLegacy(bt: BackendTransaction): Transaction {
  return {
    id: bt.id,
    cardId: bt.recommendation?.recommendedCardId ?? '',
    merchant: bt.merchantName,
    category: bt.recommendation?.merchantCategory,
    amount: bt.amount,
    currency: bt.currency,
    occurredAt: bt.createdAt,
    reward: {
      kind: 'none',
      value: 0,
      label: bt.recommendation?.estimatedBenefit ?? '',
    },
  };
}
