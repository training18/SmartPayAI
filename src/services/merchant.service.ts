/**
 * Merchant analytics service — exposes payment routing decisions and
 * commission optimization summaries.
 */

import type { MerchantAnalyticsSummary, MerchantPayment } from '@/src/types';

const seed: MerchantPayment[] = [
  {
    id: 'TX-88291A',
    amount: 1240,
    currency: 'USD',
    occurredAt: new Date().toISOString(),
    candidates: [
      { providerId: 'stripe', providerName: 'Stripe', commissionRate: 0.029 },
      { providerId: 'adyen', providerName: 'Adyen', commissionRate: 0.012 },
      { providerId: 'braintree', providerName: 'Braintree', commissionRate: 0.025 },
    ],
    routedProviderId: 'adyen',
    routingReason: 'Routed to Adyen because it offered the lowest commission (1.2%).',
  },
  {
    id: 'TX-88291B',
    amount: 45.5,
    currency: 'USD',
    occurredAt: new Date().toISOString(),
    candidates: [
      { providerId: 'braintree', providerName: 'Braintree', commissionRate: 0.025 },
      { providerId: 'stripe', providerName: 'Stripe', commissionRate: 0.015 },
      { providerId: 'paypal', providerName: 'PayPal', commissionRate: 0.032 },
    ],
    routedProviderId: 'stripe',
    routingReason: 'Routed to Stripe because it offered the lowest commission (1.5%).',
  },
  {
    id: 'TX-88291C',
    amount: 3500,
    currency: 'USD',
    occurredAt: new Date().toISOString(),
    candidates: [
      { providerId: 'paypal', providerName: 'PayPal', commissionRate: 0.032 },
      { providerId: 'ach', providerName: 'Bank ACH', commissionRate: 0.005 },
      { providerId: 'stripe', providerName: 'Stripe', commissionRate: 0.029 },
    ],
    routedProviderId: 'ach',
    routingReason: 'Routed to Bank ACH because it offered the lowest commission (0.5%).',
  },
];

function summarize(payments: MerchantPayment[]): MerchantAnalyticsSummary {
  let totalVolume = 0;
  let totalCommissionPaid = 0;
  let totalCommissionSaved = 0;

  for (const p of payments) {
    const chosen = p.candidates.find((c) => c.providerId === p.routedProviderId);
    if (!chosen) continue;
    const worst = p.candidates.reduce((a, b) => (a.commissionRate > b.commissionRate ? a : b));
    totalVolume += p.amount;
    totalCommissionPaid += p.amount * chosen.commissionRate;
    totalCommissionSaved += p.amount * (worst.commissionRate - chosen.commissionRate);
  }

  return {
    totalVolume,
    totalCommissionPaid,
    totalCommissionSaved,
    transactionCount: payments.length,
    currency: payments[0]?.currency ?? 'USD',
  };
}

export const merchantService = {
  async listPayments(): Promise<MerchantPayment[]> {
    await new Promise((r) => setTimeout(r, 150));
    return [...seed];
  },

  async getSummary(): Promise<MerchantAnalyticsSummary> {
    await new Promise((r) => setTimeout(r, 150));
    return summarize(seed);
  },
};
