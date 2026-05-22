"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AkbankConnector_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AkbankConnector = void 0;
const common_1 = require("@nestjs/common");
let AkbankConnector = AkbankConnector_1 = class AkbankConnector {
    logger = new common_1.Logger(AkbankConnector_1.name);
    bankCode = 'akbank';
    bankName = 'Akbank';
    CAMPAIGN_URL = 'https://www.akbank.com/kampanyalar#Bireysel';
    async fetch() {
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
        }
        catch (error) {
            this.logger.error(`Failed to scrape Akbank: ${error instanceof Error ? error.message : String(error)}`);
            return [];
        }
    }
    parseHtml(html, fetchedAt) {
        const campaigns = [];
        const cardRegex = /<a[^>]*href="(\/kampanyalar\/[^"]+)"[^>]*>[\s\S]*?<\/a>/gi;
        const titleRegex = /<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/gi;
        const descRegex = /<p[^>]*class="[^"]*desc[^"]*"[^>]*>([\s\S]*?)<\/p>/gi;
        const campaignBlockRegex = /kampanya[_-]?card|campaign[_-]?item|card[_-]?campaign/gi;
        const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
        let jsonLdMatch;
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
            }
            catch { }
        }
        const linkRegex = /href="(\/kampanyalar\/[a-z0-9-]+)"/gi;
        const seenUrls = new Set(campaigns.map((c) => c.url));
        let linkMatch;
        while ((linkMatch = linkRegex.exec(html)) !== null) {
            const path = linkMatch[1];
            const fullUrl = `https://www.akbank.com${path}`;
            if (seenUrls.has(fullUrl))
                continue;
            seenUrls.add(fullUrl);
            if (path === '/kampanyalar' || path.includes('tum-kampanyalar'))
                continue;
            const slug = path.split('/').pop() || '';
            const title = slug
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase());
            const contextStart = Math.max(0, linkMatch.index - 500);
            const contextEnd = Math.min(html.length, linkMatch.index + 500);
            const context = html.slice(contextStart, contextEnd);
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
        const uniqueCampaigns = new Map();
        for (const c of campaigns) {
            if (c.url && !uniqueCampaigns.has(c.url)) {
                uniqueCampaigns.set(c.url, c);
            }
        }
        return Array.from(uniqueCampaigns.values());
    }
    cleanText(text) {
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
};
exports.AkbankConnector = AkbankConnector;
exports.AkbankConnector = AkbankConnector = AkbankConnector_1 = __decorate([
    (0, common_1.Injectable)()
], AkbankConnector);
//# sourceMappingURL=akbank.connector.js.map