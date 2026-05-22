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
var MerchantIntelligenceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantIntelligenceService = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./ai.service");
const merchants_service_1 = require("../merchants/merchants.service");
const mcc_mapping_service_1 = require("../merchants/mcc-mapping.service");
const prompts_1 = require("./prompts");
const MERCHANT_OVERRIDES = {
    yemeksepeti: 'restaurant',
    getir: 'restaurant',
    'getir yemek': 'restaurant',
    trendyol: 'shopping',
    hepsiburada: 'shopping',
    amazon: 'shopping',
    n11: 'shopping',
    migros: 'grocery',
    carrefoursa: 'grocery',
    a101: 'grocery',
    bim: 'grocery',
    sok: 'grocery',
    macrocenter: 'grocery',
    starbucks: 'coffee',
    'kahve dünyası': 'coffee',
    'nero cafe': 'coffee',
    mediamarkt: 'electronics',
    teknosa: 'electronics',
    'vatan bilgisayar': 'electronics',
    shell: 'fuel',
    bp: 'fuel',
    opet: 'fuel',
    total: 'fuel',
    petrol: 'fuel',
    pegasus: 'travel',
    thy: 'travel',
    'turkish airlines': 'travel',
    'booking.com': 'travel',
    airbnb: 'travel',
    zara: 'clothing',
    'h&m': 'clothing',
    mango: 'clothing',
    'lc waikiki': 'clothing',
    adidas: 'clothing',
    nike: 'clothing',
    'burger king': 'restaurant',
    mcdonalds: 'restaurant',
    kfc: 'restaurant',
    'dominos pizza': 'restaurant',
};
let MerchantIntelligenceService = MerchantIntelligenceService_1 = class MerchantIntelligenceService {
    ai;
    merchants;
    mccMapping;
    logger = new common_1.Logger(MerchantIntelligenceService_1.name);
    constructor(ai, merchants, mccMapping) {
        this.ai = ai;
        this.merchants = merchants;
        this.mccMapping = mccMapping;
    }
    async analyze(merchantName, mcc) {
        const cached = await this.merchants.findByName(merchantName);
        if (cached) {
            this.logger.debug(`Merchant cache hit: ${merchantName} → ${cached.category}`);
            return {
                merchantCategory: cached.category,
                spendingType: cached.spendingType ?? 'discretionary',
                confidence: 0.95,
                reasoning: `Previously analyzed: ${merchantName} is categorized as ${cached.category}`,
                merchantId: cached.id,
                resolvedBy: 'cache',
            };
        }
        const override = this.fuzzyMatchOverride(merchantName);
        if (override) {
            this.logger.debug(`Merchant fuzzy match: ${merchantName} → ${override}`);
            const merchant = await this.merchants.upsert({
                name: merchantName,
                category: override,
                mcc,
                spendingType: 'discretionary',
                aiMetadata: { resolvedBy: 'fuzzy_override' },
            });
            return {
                merchantCategory: override,
                spendingType: 'discretionary',
                confidence: 0.90,
                reasoning: `Known merchant match: ${merchantName} is categorized as ${override}`,
                merchantId: merchant.id,
                resolvedBy: 'fuzzy_override',
            };
        }
        const mccCategory = this.mccMapping.resolveCategory(mcc);
        if (mccCategory) {
            this.logger.debug(`MCC resolution: ${merchantName} (MCC ${mcc}) → ${mccCategory}`);
            const merchant = await this.merchants.upsert({
                name: merchantName,
                category: mccCategory,
                mcc,
                spendingType: 'discretionary',
                aiMetadata: { resolvedBy: 'mcc_lookup', mcc },
            });
            return {
                merchantCategory: mccCategory,
                spendingType: 'discretionary',
                confidence: 0.85,
                reasoning: `MCC code ${mcc} maps to category ${mccCategory}`,
                merchantId: merchant.id,
                resolvedBy: 'mcc_lookup',
            };
        }
        this.logger.log(`Analyzing merchant via AI: ${merchantName}`);
        const aiResult = await this.ai.generateJson(prompts_1.MERCHANT_ANALYSIS_PROMPT.system, prompts_1.MERCHANT_ANALYSIS_PROMPT.buildUserPrompt(merchantName, mcc));
        const merchant = await this.merchants.upsert({
            name: merchantName,
            category: aiResult.merchantCategory,
            mcc,
            spendingType: aiResult.spendingType,
            aiMetadata: { ...aiResult, resolvedBy: 'ai_analysis' },
        });
        return {
            ...aiResult,
            merchantId: merchant.id,
            resolvedBy: 'ai_analysis',
        };
    }
    fuzzyMatchOverride(merchantName) {
        const normalized = merchantName.toLowerCase().replace(/[^a-zöçşığü0-9\s&.]/g, '').trim();
        if (MERCHANT_OVERRIDES[normalized]) {
            return MERCHANT_OVERRIDES[normalized];
        }
        for (const [key, category] of Object.entries(MERCHANT_OVERRIDES)) {
            if (normalized.includes(key) || key.includes(normalized)) {
                return category;
            }
        }
        return null;
    }
};
exports.MerchantIntelligenceService = MerchantIntelligenceService;
exports.MerchantIntelligenceService = MerchantIntelligenceService = MerchantIntelligenceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_service_1.AiService,
        merchants_service_1.MerchantsService,
        mcc_mapping_service_1.MccMappingService])
], MerchantIntelligenceService);
//# sourceMappingURL=merchant-intelligence.service.js.map