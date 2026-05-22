/**
 * Bank connector contract.
 *
 * Each connector knows how to fetch raw campaign data from a specific bank.
 * In production, connectors would scrape bank campaign pages or call mobile
 * app APIs. For the demo, they return realistic simulated data.
 *
 * The contract is intentionally minimal — connectors return raw marketing
 * text that the AI parser will normalize into structured campaign objects.
 */

export interface RawBankCampaign {
  /** Source bank name, matching the user's saved card bankName. */
  bankName: string;
  /** Original marketing copy — may be Turkish, unstructured. */
  rawText: string;
  /** Optional pre-extracted title (some APIs provide this). */
  title?: string;
  /** Source URL or API endpoint for provenance tracking. */
  url?: string;
  /** When this campaign was fetched. */
  fetchedAt: Date;
}

export interface BankConnector {
  /** Short code used for logging/config: "akbank", "isbank", etc. */
  bankCode: string;
  /** Display name matching SavedCard.bankName: "Akbank", "İş Bankası", etc. */
  bankName: string;
  /** Fetch raw campaign data from this bank. */
  fetch(): Promise<RawBankCampaign[]>;
}
