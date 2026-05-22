import { Injectable, Logger } from '@nestjs/common';
import { BankConnector, RawBankCampaign } from './bank-connector.interface';

/**
 * Akbank campaign connector — scrapes live campaign data from akbank.com.
 *
 * Source: https://www.akbank.com/kampanyalar
 *
 * The page renders campaign cards as link+text blocks.
 * We extract title, description, URL, and end dates from the raw HTML/markdown.
 */
@Injectable()
export class AkbankConnector implements BankConnector {
  private readonly logger = new Logger(AkbankConnector.name);

  readonly bankCode = 'akbank';
  readonly bankName = 'Akbank';

  private readonly CAMPAIGN_URL = 'https://www.akbank.com/kampanyalar#Bireysel';

  async fetch(): Promise<RawBankCampaign[]> {
    this.logger.log(`Scraping Akbank campaigns from ${this.CAMPAIGN_URL}`);
    const now = new Date();

    try {
      const response = await fetch(this.CAMPAIGN_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const campaigns = this.parseHtml(html, now);

      this.logger.log(`Scraped ${campaigns.length} campaigns from Akbank`);
      return campaigns;
    } catch (error) {
      this.logger.error(
        `Failed to scrape Akbank: ${error instanceof Error ? error.message : String(error)}`,
      );
      return [];
    }
  }

  private parseHtml(html: string, fetchedAt: Date): RawBankCampaign[] {
    const campaigns: RawBankCampaign[] = [];

    // Akbank campaign cards follow the pattern:
    // <a href="/kampanyalar/..."> with campaign title and description inside
    // We look for campaign card patterns in the HTML
    const cardRegex = /<a[^>]*href="(\/kampanyalar\/[^"]+)"[^>]*>[\s\S]*?<\/a>/gi;
    const titleRegex = /<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/gi;
    const descRegex = /<p[^>]*class="[^"]*desc[^"]*"[^>]*>([\s\S]*?)<\/p>/gi;

    // Try extracting campaign blocks
    const campaignBlockRegex = /kampanya[_-]?card|campaign[_-]?item|card[_-]?campaign/gi;

    // Fallback: extract from structured data or meta tags
    const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let jsonLdMatch: RegExpExecArray | null;
    while ((jsonLdMatch = jsonLdRegex.exec(html)) !== null) {
      try {
        const data = JSON.parse(jsonLdMatch[1]);
        if (data['@type'] === 'ItemList' && Array.isArray(data.itemListElement)) {
          for (const item of data.itemListElement) {
            if (item.name && item.url) {
              campaigns.push({
                bankName: this.bankName,
                title: this.cleanText(item.name),
                rawText: this.cleanText(item.description || item.name),
                url: item.url.startsWith('http') ? item.url : `https://www.akbank.com${item.url}`,
                fetchedAt,
              });
            }
          }
        }
      } catch { /* skip malformed JSON-LD */ }
    }

    // Extract campaign links from href patterns
    const linkRegex = /href="(\/kampanyalar\/[a-z0-9-]+)"/gi;
    const seenUrls = new Set(campaigns.map((c) => c.url));
    let linkMatch: RegExpExecArray | null;

    while ((linkMatch = linkRegex.exec(html)) !== null) {
      const path = linkMatch[1];
      const fullUrl = `https://www.akbank.com${path}`;
      if (seenUrls.has(fullUrl)) continue;
      seenUrls.add(fullUrl);

      // Skip generic pages
      if (path === '/kampanyalar' || path.includes('tum-kampanyalar')) continue;

      // Extract title from the path
      const slug = path.split('/').pop() || '';
      const title = slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      // Try to find surrounding text context for rawText
      const contextStart = Math.max(0, linkMatch.index - 500);
      const contextEnd = Math.min(html.length, linkMatch.index + 500);
      const context = html.slice(contextStart, contextEnd);

      // Extract any text near this link
      const nearbyText = context
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 300);

      campaigns.push({
        bankName: this.bankName,
        title,
        rawText: nearbyText || title,
        url: fullUrl,
        fetchedAt,
      });
    }

    // Deduplicate by URL
    const uniqueCampaigns = new Map<string, RawBankCampaign>();
    for (const c of campaigns) {
      if (c.url && !uniqueCampaigns.has(c.url)) {
        uniqueCampaigns.set(c.url, c);
      }
    }

    return Array.from(uniqueCampaigns.values());
  }

  private cleanText(text: string): string {
    return text
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
