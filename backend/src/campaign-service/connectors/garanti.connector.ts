import { Injectable, Logger } from '@nestjs/common';
import { BankConnector, RawBankCampaign } from './bank-connector.interface';

/**
 * Garanti BBVA campaign connector — scrapes live campaign data from bonus.com.tr.
 *
 * Source: https://www.bonus.com.tr/kampanyalar
 *
 * Garanti BBVA's credit card campaigns are published through their Bonus card portal.
 * The page renders campaign cards as markdown-friendly blocks with:
 *   [Title with bonus/discount info](campaign-url)
 *   "Son X Gün" countdown badges
 */
@Injectable()
export class GarantiConnector implements BankConnector {
  private readonly logger = new Logger(GarantiConnector.name);

  readonly bankCode = 'garanti';
  readonly bankName = 'Garanti BBVA';

  private readonly CAMPAIGN_URL = 'https://www.bonus.com.tr/kampanyalar';

  async fetch(): Promise<RawBankCampaign[]> {
    this.logger.log(`Scraping Garanti BBVA campaigns from ${this.CAMPAIGN_URL}`);
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

      this.logger.log(`Scraped ${campaigns.length} campaigns from Garanti BBVA (Bonus)`);
      return campaigns;
    } catch (error) {
      this.logger.error(
        `Failed to scrape Garanti BBVA: ${error instanceof Error ? error.message : String(error)}`,
      );
      return [];
    }
  }

  private parseHtml(html: string, fetchedAt: Date): RawBankCampaign[] {
    const campaigns: RawBankCampaign[] = [];
    const seenUrls = new Set<string>();

    // Bonus.com.tr campaign links follow the pattern:
    // href="/kampanyalar/slug-name"  or  https://www.bonus.com.tr/kampanyalar/slug
    const linkRegex = /href="((?:https:\/\/www\.bonus\.com\.tr)?\/kampanyalar\/([a-z0-9-]+))"/gi;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(html)) !== null) {
      const rawPath = match[1];
      const slug = match[2];
      const fullUrl = rawPath.startsWith('http')
        ? rawPath
        : `https://www.bonus.com.tr${rawPath}`;

      if (seenUrls.has(fullUrl)) continue;
      seenUrls.add(fullUrl);

      // Skip category/sector filter pages
      if (
        slug === 'kampanyalar' ||
        slug.startsWith('sektor/') ||
        slug.startsWith('marka/') ||
        !slug.includes('-')
      ) continue;

      // Extract surrounding context for rawText
      const contextStart = Math.max(0, match.index - 100);
      const contextEnd = Math.min(html.length, match.index + 600);
      const context = html.slice(contextStart, contextEnd);

      const rawText = context
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Extract campaign title from slug and nearby text
      const titleFromSlug = slug
        .replace(/-/g, ' ')
        .replace(/kampanyalari?$/i, '')
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();

      // Try to find a better title from nearby heading or link text
      const nearbyTitleMatch = rawText.match(
        /([A-ZÇĞİÖŞÜa-zçğıöşü0-9%'".,!?'&\-€$₺ ]{5,150}?(?:bonus|indirim|taksit|fırsat|kampanya|TL|puan|cashback|nakit iade)[\s!.]*)/i,
      );

      const title = nearbyTitleMatch
        ? nearbyTitleMatch[1].trim().slice(0, 120)
        : titleFromSlug;

      // Detect "Son X Gün" countdown
      const countdownMatch = rawText.match(/Son\s+(\d+)\s+Gün/i);
      let enrichedText = rawText.slice(0, 400);
      if (countdownMatch) {
        enrichedText += ` (Son ${countdownMatch[1]} gün)`;
      }

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
