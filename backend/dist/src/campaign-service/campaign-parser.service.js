"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CampaignParserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignParserService = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("../ai/ai.service");
const campaign_parser_prompt_1 = require("./prompts/campaign-parser.prompt");
let CampaignParserService = CampaignParserService_1 = class CampaignParserService {
    ai;
    logger = new common_1.Logger(CampaignParserService_1.name);
    constructor(ai) {
        this.ai = ai;
    }
    async parse(raw) {
        try {
            const parsed = await this.ai.generateJson(campaign_parser_prompt_1.CAMPAIGN_PARSER_PROMPT.system, campaign_parser_prompt_1.CAMPAIGN_PARSER_PROMPT.buildUserPrompt(raw.rawText, raw.bankName, raw.title));
            this.logger.debug(`Parsed campaign: "${parsed.title}" → ${parsed.category} / ${parsed.rewardType} / ${parsed.rewardPercent}%`);
            return this.sanitize(parsed, raw);
        }
        catch (error) {
            this.logger.warn(`AI parsing failed for "${raw.title ?? 'unknown'}": ${error instanceof Error ? error.message : String(error)}`);
            return this.fallbackParse(raw);
        }
    }
    async parseBatch(raws) {
        const results = [];
        for (const raw of raws) {
            const parsed = await this.parse(raw);
            results.push(parsed);
            await new Promise((r) => setTimeout(r, 200));
        }
        return results;
    }
    sanitize(parsed, raw) {
        return {
            ...parsed,
            title: parsed.title || raw.title || 'Untitled Campaign',
            rewardPercent: Math.max(0, Math.min(100, Number(parsed.rewardPercent) || 0)),
            minAmount: parsed.minAmount != null ? Math.max(0, Number(parsed.minAmount)) : null,
            maxReward: parsed.maxReward != null ? Math.max(0, Number(parsed.maxReward)) : null,
            channels: Array.isArray(parsed.channels) ? parsed.channels : ['online', 'offline'],
            merchants: Array.isArray(parsed.merchants) ? parsed.merchants : [],
            confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0)),
        };
    }
    fallbackParse(raw) {
        const text = raw.rawText.toLowerCase();
        const pctMatch = text.match(/%(\d+(?:\.\d+)?)/);
        const rewardPercent = pctMatch ? parseFloat(pctMatch[1]) : 0;
        let rewardType = 'CASHBACK';
        let rewardCurrency = 'TL';
        if (text.includes('maxipuan')) {
            rewardType = 'POINTS';
            rewardCurrency = 'MaxiPuan';
        }
        else if (text.includes('worldpuan')) {
            rewardType = 'POINTS';
            rewardCurrency = 'Worldpuan';
        }
        else if (text.includes('chip-para') || text.includes('chippara')) {
            rewardType = 'POINTS';
            rewardCurrency = 'chip-para';
        }
        else if (text.includes('bonus puan')) {
            rewardType = 'POINTS';
            rewardCurrency = 'bonus';
        }
        else if (text.includes('mil')) {
            rewardType = 'MILES';
            rewardCurrency = 'mil';
        }
        else if (text.includes('indirim')) {
            rewardType = 'DISCOUNT';
            rewardCurrency = 'TL';
        }
        else if (text.includes('nakit iade') || text.includes('cashback')) {
            rewardType = 'CASHBACK';
            rewardCurrency = 'TL';
        }
        let category = 'other';
        if (text.includes('market') || text.includes('migros') || text.includes('carrefour'))
            category = 'grocery';
        else if (text.includes('restoran') || text.includes('yemek') || text.includes('kafe'))
            category = 'restaurant';
        else if (text.includes('kahve') || text.includes('starbucks'))
            category = 'coffee';
        else if (text.includes('elektronik') || text.includes('teknosa') || text.includes('mediamarkt'))
            category = 'electronics';
        else if (text.includes('akaryakıt') || text.includes('yakıt') || text.includes('shell'))
            category = 'fuel';
        else if (text.includes('seyahat') || text.includes('havayolu') || text.includes('otel'))
            category = 'travel';
        else if (text.includes('giyim') || text.includes('zara') || text.includes('h&m'))
            category = 'clothing';
        else if (text.includes('online alışveriş') || text.includes('e-ticaret'))
            category = 'shopping';
        let network = null;
        if (text.includes('mastercard'))
            network = 'Mastercard';
        else if (text.includes('visa'))
            network = 'Visa';
        else if (text.includes('troy'))
            network = 'Troy';
        const maxMatch = text.match(/maksimum\s+(\d+)/);
        const maxReward = maxMatch ? parseFloat(maxMatch[1]) : null;
        this.logger.debug(`Fallback parsed: "${raw.title ?? 'unknown'}" → ${category} / ${rewardType} / ${rewardPercent}%`);
        return {
            title: raw.title || 'Untitled Campaign',
            category,
            rewardType,
            rewardPercent,
            rewardCurrency,
            network,
            cardType: 'CREDIT',
            channels: ['online', 'offline'],
            minAmount: null,
            maxReward,
            startsAt: null,
            endsAt: null,
            merchants: [],
            confidence: 0.5,
        };
    }
};
exports.CampaignParserService = CampaignParserService;
exports.CampaignParserService = CampaignParserService = CampaignParserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], CampaignParserService);
//# sourceMappingURL=campaign-parser.service.js.map