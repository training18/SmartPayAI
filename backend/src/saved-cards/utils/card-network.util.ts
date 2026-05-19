/**
 * Card-network detection utility.
 *
 * Maps the leading digits (BIN/IIN) of a PAN to the issuing network. The
 * recommendation engine uses this to reason about network-tier campaigns
 * (e.g. "Mastercard World", "Visa Platinum") that the issuing bank attaches
 * to its product programs.
 *
 * Only the first 4 digits (`first4`) are required — that's all SmartPay ever
 * stores. Detection is deterministic; if no rule matches we return UNKNOWN.
 */

export type CardNetwork =
  | 'VISA'
  | 'MASTERCARD'
  | 'AMEX'
  | 'TROY'
  | 'DISCOVER'
  | 'JCB'
  | 'DINERS'
  | 'UNIONPAY'
  | 'UNKNOWN';

export interface CardNetworkInfo {
  /** Canonical machine identifier. */
  network: CardNetwork;
  /** Human-readable label used inside AI prompts. */
  label: string;
}

/**
 * Detect the card network from the first 4 digits of a PAN.
 *
 * Accepts any string; non-digits are stripped, anything shorter than the
 * required prefix yields UNKNOWN.
 */
export function detectCardNetwork(first4: string | null | undefined): CardNetworkInfo {
  const digits = (first4 ?? '').replace(/[^0-9]/g, '').slice(0, 4);
  if (!digits) return { network: 'UNKNOWN', label: 'Unknown' };

  const d2 = digits.slice(0, 2);
  const d3 = digits.slice(0, 3);
  const n4 = digits.length === 4 ? parseInt(digits, 10) : NaN;

  // Visa — starts with 4
  if (digits[0] === '4') return { network: 'VISA', label: 'Visa' };

  // Mastercard — 51–55 or 2221–2720
  if (/^5[1-5]$/.test(d2)) return { network: 'MASTERCARD', label: 'Mastercard' };
  if (!Number.isNaN(n4) && n4 >= 2221 && n4 <= 2720) {
    return { network: 'MASTERCARD', label: 'Mastercard' };
  }

  // American Express — 34, 37
  if (d2 === '34' || d2 === '37') return { network: 'AMEX', label: 'American Express' };

  // Troy (Türkiye) — 9792
  if (digits === '9792') return { network: 'TROY', label: 'Troy' };

  // JCB — 3528–3589
  if (!Number.isNaN(n4) && n4 >= 3528 && n4 <= 3589) return { network: 'JCB', label: 'JCB' };

  // Diners Club — 300–305, 36, 38, 39
  if (/^30[0-5]$/.test(d3) || d2 === '36' || d2 === '38' || d2 === '39') {
    return { network: 'DINERS', label: 'Diners Club' };
  }

  // Discover — 6011, 65, 644–649
  if (digits === '6011' || d2 === '65' || /^64[4-9]$/.test(d3)) {
    return { network: 'DISCOVER', label: 'Discover' };
  }

  // UnionPay — 62
  if (d2 === '62') return { network: 'UNIONPAY', label: 'UnionPay' };

  return { network: 'UNKNOWN', label: 'Unknown' };
}
