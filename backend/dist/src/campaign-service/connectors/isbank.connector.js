"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var IsbankConnector_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsbankConnector = void 0;
const common_1 = require("@nestjs/common");
let IsbankConnector = IsbankConnector_1 = class IsbankConnector {
    logger = new common_1.Logger(IsbankConnector_1.name);
    bankCode = 'isbank';
    bankName = 'İş Bankası';
    CAMPAIGN_URL = 'https://www.isbank.com.tr/kampanyalar';
    async fetch() {
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
        }
        catch (error) {
            this.logger.error(`Failed to scrape İş Bankası: ${error instanceof Error ? error.message : String(error)}`);
            return [];
        }
    }
    parseHtml(html, fetchedAt) {
        const campaigns = [];
        const seenUrls = new Set();
        const campaignLinkRegex = /href="(\/kampanyalar\/[a-z0-9-]+(?:#[a-z]*)?)"/gi;
        let match;
        while ((match = campaignLinkRegex.exec(html)) !== null) {
            const path = match[1].replace(/#.*$/, '');
            const fullUrl = `https://www.isbank.com.tr${path}`;
            if (seenUrls.has(fullUrl))
                continue;
            seenUrls.add(fullUrl);
            if (path === '/kampanyalar' ||
                path.includes('?v=') ||
                path.includes('kampanyalar/pos-') ||
                path.includes('#gecmis'))
                continue;
            const contextStart = Math.max(0, match.index - 200);
            const contextEnd = Math.min(html.length, match.index + 800);
            const context = html.slice(contextStart, contextEnd);
            const rawText = context
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            const titleMatch = rawText.match(/([A-ZÇĞİÖŞÜa-zçğıöşü0-9%'".,!?'&\- ]{10,120}?)(?:\s*Bitiş Tarihi|\s*Detay)/);
            const slug = path.split('/').pop() || '';
            const title = titleMatch
                ? titleMatch[1].trim()
                : slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
            const dateMatch = rawText.match(/Bitiş Tarihi:\s*(\d{2}\.\d{2}\.\d{4})/);
            const endDate = dateMatch ? dateMatch[1] : null;
            let campaignText = title;
            if (endDate)
                campaignText += ` Bitiş Tarihi: ${endDate}.`;
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
};
exports.IsbankConnector = IsbankConnector;
exports.IsbankConnector = IsbankConnector = IsbankConnector_1 = __decorate([
    (0, common_1.Injectable)()
], IsbankConnector);
//# sourceMappingURL=isbank.connector.js.map