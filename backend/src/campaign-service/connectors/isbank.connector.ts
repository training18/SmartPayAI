import { Injectable, Logger } from '@nestjs/common';
import { BankConnector, RawBankCampaign } from './bank-connector.interface';

/**
 * İş Bankası campaign connector — scrapes live campaign data from isbank.com.tr.
 *
 * Source: https://www.isbank.com.tr/kampanyalar
 *
 * The page renders campaign cards with titles, descriptions, end dates,
 * and detail links. Format observed:
 *   [Title\n\nBitiş Tarihi: DD.MM.YYYY\n\nDescription](url)
 */
@Injectable()
export class IsbankConnector implements BankConnector {
  private readonly logger = new Logger(IsbankConnector.name);

  readonly bankCode = 'isbank';
  readonly bankName = 'İş Bankası';

  private readonly CAMPAIGN_URL = 'https://www.isbank.com.tr/kampanyalar';

  async fetch(): Promise<RawBankCampaign[]> {
    this.logger.log(`Scraping İş Bankası campaigns from ${this.CAMPAIGN_URL}`);
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

      this.logger.log(`Scraped ${campaigns.length} campaigns from İş Bankası`);
      return campaigns;
    } catch (error) {
      this.logger.error(
        `Failed to scrape İş Bankası: ${error instanceof Error ? error.message : String(error)}`,
      );
      return [];
    }
  }

  private parseHtml(html: string, fetchedAt: Date): RawBankCampaign[] {
    const campaigns: RawBankCampaign[] = [];
    const seenUrls = new Set<string>();

    // İş Bankası campaign cards contain:
    // - href to /kampanyalar/slug
    // - Title text
    // - "Bitiş Tarihi: DD.MM.YYYY"
    // - Description paragraph
    const campaignLinkRegex = /href="(\/kampanyalar\/[a-z0-9-]+(?:#[a-z]*)?)"/gi;
    let match: RegExpExecArray | null;

    while ((match = campaignLinkRegex.exec(html)) !== null) {
      const path = match[1].replace(/#.*$/, '');
      const fullUrl = `https://www.isbank.com.tr${path}`;

      if (seenUrls.has(fullUrl)) continue;
      seenUrls.add(fullUrl);

      // Skip category/filter pages
      if (
        path === '/kampanyalar' ||
        path.includes('?v=') ||
        path.includes('kampanyalar/pos-') ||
        path.includes('#gecmis')
      ) continue;

      // Extract surrounding context (up to 600 chars around the link)
      const contextStart = Math.max(0, match.index - 200);
      const contextEnd = Math.min(html.length, match.index + 800);
      const context = html.slice(contextStart, contextEnd);

      // Strip HTML tags for raw text
      const rawText = context
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Extract title from the text — usually the first meaningful sentence
      const titleMatch = rawText.match(/([A-ZÇĞİÖŞÜa-zçğıöşü0-9%'".,!?'&\- ]{10,120}?)(?:\s*Bitiş Tarihi|\s*Detay)/);
      const slug = path.split('/').pop() || '';
      const title = titleMatch
        ? titleMatch[1].trim()
        : slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

      // Extract end date
      const dateMatch = rawText.match(/Bitiş Tarihi:\s*(\d{2}\.\d{2}\.\d{4})/);
      const endDate = dateMatch ? dateMatch[1] : null;

      // Build meaningful rawText for AI parsing
      let campaignText = title;
      if (endDate) campaignText += ` Bitiş Tarihi: ${endDate}.`;

      // Add any additional description
      const descSnippet = rawText.slice(0, 400);
      if (descSnippet.length > title.length + 20) {
        campaignText = descSnippet;
      }

      campaigns.push({
        bankName: this.bankName,
        title,
        rawText: campaignText,
        url: fullUrl,
        fetchedAt,
      });
    }

    return campaigns;
  }
}
