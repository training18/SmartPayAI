/**
 * Pure formatting helpers — no side effects, no React imports.
 */

export function formatCurrency(amount: number, currency = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

export function formatPercent(rate: number, fractionDigits = 1): string {
  return `${(rate * 100).toFixed(fractionDigits)}%`;
}

export function formatMaskedPan(last4: string): string {
  return `•••• •••• •••• ${last4}`;
}

export function formatExpiry(month: number, year: number): string {
  const mm = String(month).padStart(2, '0');
  const yy = String(year).padStart(2, '0').slice(-2);
  return `${mm}/${yy}`;
}

export function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
