"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./ai.service");
const merchant_intelligence_service_1 = require("./merchant-intelligence.service");
const card_recommendation_service_1 = require("./card-recommendation.service");
const merchants_module_1 = require("../merchants/merchants.module");
const campaigns_module_1 = require("../campaigns/campaigns.module");
const saved_cards_module_1 = require("../saved-cards/saved-cards.module");
const ai_controller_1 = require("./ai.controller");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        imports: [merchants_module_1.MerchantsModule, campaigns_module_1.CampaignsModule, saved_cards_module_1.SavedCardsModule],
        controllers: [ai_controller_1.AiController],
        providers: [ai_service_1.AiService, merchant_intelligence_service_1.MerchantIntelligenceService, card_recommendation_service_1.CardRecommendationService],
        exports: [ai_service_1.AiService, merchant_intelligence_service_1.MerchantIntelligenceService, card_recommendation_service_1.CardRecommendationService],
    })
], AiModule);
//# sourceMappingURL=ai.module.js.map