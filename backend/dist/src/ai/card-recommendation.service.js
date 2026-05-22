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
const campaign_cache_service_1 = require("../campaign-service/campaign-cache.service");
const saved_cards_service_1 = require("../saved-cards/saved-cards.service");
const card_scoring_service_1 = require("./card-scoring.service");
const routing_simulation_service_1 = require("./routing-simulation.service");
const savings_service_1 = require("../savings/savings.service");
const prompts_1 = require("./prompts");
let CardRecommendationService = CardRecommendationService_1 = class CardRecommendationService {
    ai;
    campaignCache;
    savedCards;
    scoring;
    routing;
    savings;
    logger = new common_1.Logger(CardRecommendationService_1.name);
    constructor(ai, campaignCache, savedCards, scoring, routing, savings) {
        this.ai = ai;
        this.campaignCache = campaignCache;
        this.savedCards = savedCards;
        this.scoring = scoring;
        this.routing = routing;
        this.savings = savings;
    }
    async recommend(userId, merchantName, merchantCategory, amount, currency = 'TRY') {
        const userCards = await this.savedCards.findAllByUser(userId);
        if (userCards.length === 0) {
            return this.emptyRecommendation();
        }
        const bankNames = [...new Set(userCards.map((c) => c.bankName))];
        const activeCampaigns = await this.campaignCache.getActiveCampaigns(merchantCategory, bankNames);
        this.logger.log(`[Recommend] ${merchantName} (${merchantCategory}) — ${userCards.length} cards, ` +
            `${activeCampaigns.length} live campaigns from ${bankNames.join(', ')}`);
        const scored = this.scoring.scoreCards(userCards, activeCampaigns, amount);
        const candidates = scored.map((s) => ({
            cardId: s.cardId,
            bankName: s.bankName,
            cardType: s.cardType,
            first4: s.first4,
            network: s.network,
            networkLabel: s.networkLabel,
            cardAlias: s.cardAlias,
            rewardType: s.rewardType,
            expectedReward: s.bestMatch
                ? {
                    value: s.bestMatch.rewardValue,
                    valueTL: s.bestMatch.rewardValueTL,
                    unit: s.bestMatch.rewardUnit,
                    type: s.bestMatch.rewardType,
                    campaignTitle: s.bestMatch.title,
                }
                : null,
            matchedCampaigns: s.matches.map((m) => ({
                title: m.title,
                rewardRate: m.rewardRate,
                rewardValue: m.rewardValue,
                rewardUnit: m.rewardUnit,
            })),
        }));
        const hasAnyActiveCampaign = scored.some((s) => s.bestMatch !== null);
        let aiResult;
        if (candidates.length === 1 || !hasAnyActiveCampaign) {
            this.logger.log(`[Recommend] Trivial recommendation: Bypassing AI call (candidates: ${candidates.length}, campaigns: ${activeCampaigns.length})`);
            const winner = scored[0];
            const rejectedCards = scored
                .slice(1)
                .map((c) => ({
                cardId: c.cardId,
                reason: 'No active campaign found for this category.',
            }));
            aiResult = {
                recommendedCardId: winner.cardId,
                recommendedBank: winner.bankName,
                recommendedNetwork: winner.networkLabel,
                reason: 'No active campaign in this spending category, thus the most suitable card was selected.',
                estimatedBenefit: '0.00 TL',
                confidence: 1.0,
                rewardBreakdown: null,
                rejectedCards,
            };
        }
        else {
            this.logger.log(`Recommending for ${merchantName} (${merchantCategory}) — ${candidates.length} candidates, ` +
                `${activeCampaigns.length} active campaigns`);
            aiResult = await this.ai.generateJson(prompts_1.CARD_RECOMMENDATION_PROMPT.system, prompts_1.CARD_RECOMMENDATION_PROMPT.buildUserPrompt({
                merchantName,
                merchantCategory,
                amount,
                currency,
                candidates,
            }));
        }
        const plan = this.routing.buildPlan({
            scored,
            aiSelectedCardId: aiResult.recommendedCardId,
            aiRewardBreakdown: aiResult.rewardBreakdown ?? null,
        });
        const winnerCard = scored.find((s) => s.cardId === plan.selectedCardId) ?? scored[0];
        const savings = winnerCard
            ? this.savings.calculateSavings(amount, winnerCard, scored)
            : {
                cashbackEarned: 0,
                discountAmount: 0,
                pointsValue: 0,
                installmentValue: 0,
                totalSavedAmount: 0,
            };
        const rejectedWithReasons = plan.rejectedCards.map((r) => {
            const aiReason = aiResult.rejectedCards?.find((x) => x.cardId === r.cardId)?.reason;
            return aiReason ? { ...r, reason: aiReason } : r;
        });
        return {
            recommendedCardId: plan.selectedCardId,
            recommendedBank: plan.selectedBank,
            recommendedNetwork: plan.selectedNetwork,
            reason: aiResult.reason,
            estimatedBenefit: aiResult.estimatedBenefit,
            confidence: aiResult.confidence,
            rewardBreakdown: aiResult.rewardBreakdown ?? null,
            routingPlan: { ...plan, rejectedCards: rejectedWithReasons },
            savings,
            aiRaw: aiResult,
        };
    }
    emptyRecommendation() {
        return {
            recommendedCardId: null,
            recommendedBank: 'N/A',
            recommendedNetwork: 'Unknown',
            reason: 'No saved cards found. Please add your cards to receive AI-powered recommendations.',
            estimatedBenefit: 'N/A',
            confidence: 0,
            rewardBreakdown: null,
            routingPlan: null,
            savings: {
                cashbackEarned: 0,
                discountAmount: 0,
                pointsValue: 0,
                installmentValue: 0,
                totalSavedAmount: 0,
            },
            aiRaw: null,
        };
    }
};
exports.CardRecommendationService = CardRecommendationService;
exports.CardRecommendationService = CardRecommendationService = CardRecommendationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_service_1.AiService,
        campaign_cache_service_1.CampaignCacheService,
        saved_cards_service_1.SavedCardsService,
        card_scoring_service_1.CardScoringService,
        routing_simulation_service_1.RoutingSimulationService,
        savings_service_1.SavingsService])
], CardRecommendationService);
//# sourceMappingURL=card-recommendation.service.js.map