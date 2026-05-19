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
const prompts_1 = require("./prompts");
let MerchantIntelligenceService = MerchantIntelligenceService_1 = class MerchantIntelligenceService {
    ai;
    merchants;
    logger = new common_1.Logger(MerchantIntelligenceService_1.name);
    constructor(ai, merchants) {
        this.ai = ai;
        this.merchants = merchants;
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
            };
        }
        this.logger.log(`Analyzing merchant via AI: ${merchantName}`);
        const aiResult = await this.ai.generateJson(prompts_1.MERCHANT_ANALYSIS_PROMPT.system, prompts_1.MERCHANT_ANALYSIS_PROMPT.buildUserPrompt(merchantName, mcc));
        const merchant = await this.merchants.upsert({
            name: merchantName,
            category: aiResult.merchantCategory,
            mcc,
            spendingType: aiResult.spendingType,
            aiMetadata: aiResult,
        });
        return {
            ...aiResult,
            merchantId: merchant.id,
        };
    }
};
exports.MerchantIntelligenceService = MerchantIntelligenceService;
exports.MerchantIntelligenceService = MerchantIntelligenceService = MerchantIntelligenceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_service_1.AiService,
        merchants_service_1.MerchantsService])
], MerchantIntelligenceService);
//# sourceMappingURL=merchant-intelligence.service.js.map