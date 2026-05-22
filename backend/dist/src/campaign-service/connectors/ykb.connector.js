"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var YkbConnector_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.YkbConnector = void 0;
const common_1 = require("@nestjs/common");
let YkbConnector = YkbConnector_1 = class YkbConnector {
    logger = new common_1.Logger(YkbConnector_1.name);
    bankCode = 'ykb';
    bankName = 'Yapı Kredi';
    CAMPAIGN_URL = 'https://www.worldcard.com.tr/kampanyalar';
    async fetch() {
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
        }
        catch (error) {
            this.logger.error(`Failed to scrape Yapı Kredi: ${error instanceof Error ? error.message : String(error)}`);
            return [];
        }
    }
    parseHtml(html, fetchedAt) {
        const campaigns = [];
        const seenUrls = new Set();
        const linkRegex = /href="((?:https:\/\/www\.worldcard\.com\.tr)?\/kampanyalar\/([a-z0-9-]+))"/gi;
        let match;
        while ((match = linkRegex.exec(html)) !== null) {
            const rawPath = match[1];
            const slug = match[2];
            const fullUrl = rawPath.startsWith('http')
                ? rawPath
                : `https://www.worldcard.com.tr${rawPath}`;
            if (seenUrls.has(fullUrl))
                continue;
            seenUrls.add(fullUrl);
            if (slug === 'kampanyalar' ||
                slug.startsWith('sektor/') ||
                slug.startsWith('marka/') ||
                !slug.includes('-'))
                continue;
            const contextStart = Math.max(0, match.index - 100);
            const contextEnd = Math.min(html.length, match.index + 600);
            const context = html.slice(contextStart, contextEnd);
            const rawText = context
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            const titleFromSlug = slug
                .replace(/-/g, ' ')
                .replace(/kampanyalari?$/i, '')
                .replace(/\b\w/g, (c) => c.toUpperCase())
                .trim();
            const nearbyTitleMatch = rawText.match(/([A-ZÇĞİÖŞÜa-zçğıöşü0-9%'".,!?'&\-€$₺ ]{5,150}?(?:taksit|worldpuan|puan|indirim|fırsat|kampanya|TL|bonus|nakit)[\s!.]*)/i);
            const title = nearbyTitleMatch
                ? nearbyTitleMatch[1].trim().slice(0, 120)
                : titleFromSlug;
            const dateMatch = rawText.match(/Son gün:\s*(\d{2}\.\d{2}\.\d{4})/i);
            const countdownMatch = rawText.match(/Son\s+(\d+)\s+Gün/i);
            let enrichedText = rawText.slice(0, 400);
            if (dateMatch)
                enrichedText += ` Son gün: ${dateMatch[1]}`;
            if (countdownMatch)
                enrichedText += ` (Son ${countdownMatch[1]} gün)`;
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
};
exports.YkbConnector = YkbConnector;
exports.YkbConnector = YkbConnector = YkbConnector_1 = __decorate([
    (0, common_1.Injectable)()
], YkbConnector);
//# sourceMappingURL=ykb.connector.js.map