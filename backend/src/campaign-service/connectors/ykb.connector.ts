import { Injectable, Logger } from '@nestjs/common';
import { BankConnector, RawBankCampaign } from './bank-connector.interface';

/**
 * Yapı Kredi campaign connector — scrapes live campaign data from worldcard.com.tr.
 *
 * Source: https://www.worldcard.com.tr/kampanyalar
 *
 * Yapı Kredi's credit card campaigns are published through their Worldcard portal.
 * The page renders campaign cards with titles, descriptions, Worldpuan details,
 * and end dates.
 */
@Injectable()
export class YkbConnector implements BankConnector {
  private readonly logger = new Logger(YkbConnector.name);

  readonly bankCode = 'ykb';
  readonly bankName = 'Yapı Kredi';

  private readonly CAMPAIGN_URL = 'https://www.worldcard.com.tr/kampanyalar';

  async fetch(): Promise<RawBankCampaign[]> {
    this.logger.log(`Scraping Yapı Kredi campaigns from ${this.CAMPAIGN_URL}`);
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

      this.logger.log(`Scraped ${campaigns.length} campaigns from Yapı Kredi (Worldcard)`);
      return campaigns;
    } catch (error) {
      this.logger.error(
        `Failed to scrape Yapı Kredi: ${error instanceof Error ? error.message : String(error)}`,
      );
      return [];
    }
  }

  private parseHtml(html: string, fetchedAt: Date): RawBankCampaign[] {
    const campaigns: RawBankCampaign[] = [];
    const seenUrls = new Set<string>();

    // Worldcard campaign links follow the pattern:
    // href="/kampanyalar/slug" or href="https://www.worldcard.com.tr/kampanyalar/slug"
    const linkRegex = /href="((?:https:\/\/www\.worldcard\.com\.tr)?\/kampanyalar\/([a-z0-9-]+))"/gi;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(html)) !== null) {
      const rawPath = match[1];
      const slug = match[2];
      const fullUrl = rawPath.startsWith('http')
        ? rawPath
        : `https://www.worldcard.com.tr${rawPath}`;

      if (seenUrls.has(fullUrl)) continue;
      seenUrls.add(fullUrl);

      // Skip category/filter pages and main kampanyalar
      if (
        slug === 'kampanyalar' ||
        slug.startsWith('sektor/') ||
        slug.startsWith('marka/') ||
        !slug.includes('-')
      ) continue;

      // Extract surrounding context
      const contextStart = Math.max(0, match.index - 100);
      const contextEnd = Math.min(html.length, match.index + 600);
      const context = html.slice(contextStart, contextEnd);

      const rawText = context
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Build title from slug
      const titleFromSlug = slug
        .replace(/-/g, ' ')
        .replace(/kampanyalari?$/i, '')
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();

      // Try to extract a better title from nearby text
      const nearbyTitleMatch = rawText.match(
        /([A-ZÇĞİÖŞÜa-zçğıöşü0-9%'".,!?'&\-€$₺ ]{5,150}?(?:taksit|worldpuan|puan|indirim|fırsat|kampanya|TL|bonus|nakit)[\s!.]*)/i,
      );

      const title = nearbyTitleMatch
        ? nearbyTitleMatch[1].trim().slice(0, 120)
        : titleFromSlug;

      // Detect countdown or end date
      const dateMatch = rawText.match(/Son gün:\s*(\d{2}\.\d{2}\.\d{4})/i);
      const countdownMatch = rawText.match(/Son\s+(\d+)\s+Gün/i);

      let enrichedText = rawText.slice(0, 400);
      if (dateMatch) enrichedText += ` Son gün: ${dateMatch[1]}`;
      if (countdownMatch) enrichedText += ` (Son ${countdownMatch[1]} gün)`;

      campaigns.push({
        bankName: this.bankName,
        title,
        rawText: enrichedText,
        url: fullUrl,
        fetchedAt,
      });
    }

    return campaigns;
  }
}
