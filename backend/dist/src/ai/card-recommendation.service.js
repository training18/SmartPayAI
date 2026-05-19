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
var CardRecommendationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardRecommendationService = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./ai.service");
const campaigns_service_1 = require("../campaigns/campaigns.service");
const saved_cards_service_1 = require("../saved-cards/saved-cards.service");
const card_network_util_1 = require("../saved-cards/utils/card-network.util");
const prompts_1 = require("./prompts");
let CardRecommendationService = CardRecommendationService_1 = class CardRecommendationService {
    ai;
    campaigns;
    savedCards;
    logger = new common_1.Logger(CardRecommendationService_1.name);
    constructor(ai, campaigns, savedCards) {
        this.ai = ai;
        this.campaigns = campaigns;
        this.savedCards = savedCards;
    }
    async recommend(userId, merchantName, merchantCategory, amount, currency = 'TRY') {
        const userCards = await this.savedCards.findAllByUser(userId);
        if (userCards.length === 0) {
            return {
                recommendedCardId: null,
                recommendedBank: 'N/A',
                reason: 'No saved cards found. Please add your cards to receive AI-powered recommendations.',
                estimatedBenefit: 'N/A',
                confidence: 0,
            };
        }
        const bankNames = [...new Set(userCards.map((c) => c.bankName))];
        const activeCampaigns = await this.campaigns.findByCategory(merchantCategory, bankNames);
        const cardContext = userCards.map((c) => {
            const net = (0, card_network_util_1.detectCardNetwork)(c.first4);
            return {
                id: c.id,
                bankName: c.bankName,
                cardType: c.cardType,
                first4: c.first4,
                network: net.network,
                networkLabel: net.label,
                cardAlias: c.cardAlias ?? undefined,
                rewardType: c.rewardType,
            };
        });
        const campaignContext = activeCampaigns.map((c) => ({
            title: c.title,
            bankName: c.bankName,
            category: c.category,
            rewardType: c.rewardType,
            rewardRate: Number(c.rewardRate),
            maxReward: c.maxReward ? Number(c.maxReward) : undefined,
            installmentCount: c.installmentCount ?? undefined,
            description: c.description,
        }));
        this.logger.log(`Generating card recommendation for ${merchantName} (${merchantCategory}), amount: ${amount} ${currency}`);
        const aiResult = await this.ai.generateJson(prompts_1.CARD_RECOMMENDATION_PROMPT.system, prompts_1.CARD_RECOMMENDATION_PROMPT.buildUserPrompt({
            merchantName,
            merchantCategory,
            amount,
            currency,
            userCards: cardContext,
            activeCampaigns: campaignContext,
        }));
        const recommendedCard = userCards.find((c) => c.id === aiResult.recommendedCardId);
        if (!recommendedCard && userCards.length > 0) {
            const fallback = userCards.find((c) => c.bankName === aiResult.recommendedBank) ?? userCards[0];
            aiResult.recommendedCardId = fallback.id;
            aiResult.recommendedBank = fallback.bankName;
        }
        return aiResult;
    }
};
exports.CardRecommendationService = CardRecommendationService;
exports.CardRecommendationService = CardRecommendationService = CardRecommendationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_service_1.AiService,
        campaigns_service_1.CampaignsService,
        saved_cards_service_1.SavedCardsService])
], CardRecommendationService);
//# sourceMappingURL=card-recommendation.service.js.map