/**
 * Merchant-user analytics domain types.
 *
 * Each `MerchantPayment` carries the alternative provider quotes evaluated
 * by the routing engine plus the chosen provider, so the dashboard can
 * justify *why* a transaction was routed where it was.
 */

export interface ProviderQuote {
  providerId: string;
  providerName: string;
  /** Commission as a fraction (e.g. 0.05 for 5%). */
  commissionRate: number;
}

export interface MerchantPayment {
  id: string;
  amount: number;
  currency: string;
  occurredAt: string;
  /** All providers considered by the routing engine for this payment. */
  candidates: ProviderQuote[];
  /** `providerId` of the chosen route — must exist in `candidates`. */
  routedProviderId: string;
  /** Human-readable optimization rationale rendered on the merchant dashboard. */
  routingReason: string;
}

export interface MerchantAnalyticsSummary {
  totalVolume: number;
  totalCommissionPaid: number;
  totalCommissionSaved: number;
  transactionCount: number;
  currency: string;
}
