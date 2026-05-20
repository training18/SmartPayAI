"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CardScoringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardScoringService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const card_network_util_1 = require("../saved-cards/utils/card-network.util");
let CardScoringService = CardScoringService_1 = class CardScoringService {
    logger = new common_1.Logger(CardScoringService_1.name);
    scoreCards(cards, campaigns, amount) {
        const scored = cards.map((card) => this.scoreSingleCard(card, campaigns, amount));
        scored.sort((a, b) => b.score - a.score);
        this.logger.debug(`Scored ${scored.length} cards — top: ${scored[0]?.bankName} (score=${scored[0]?.score.toFixed(2)} TL)`);
        return scored;
    }
    scoreSingleCard(card, campaigns, amount) {
        const net = (0, card_network_util_1.detectCardNetwork)(card.first4);
        const matches = campaigns
            .filter((c) => this.campaignApplies(c, card, net.network))
            .map((c) => this.computeReward(c, amount))
            .sort((a, b) => b.rewardValueTL - a.rewardValueTL);
        const best = matches[0] ?? null;
        return {
            cardId: card.id,
            bankName: card.bankName,
            cardType: card.cardType,
            first4: card.first4,
            network: net.network,
            networkLabel: net.label,
            cardAlias: card.cardAlias,
            rewardType: card.rewardType,
            bestMatch: best,
            matches,
            score: best?.rewardValueTL ?? 0,
        };
    }
    campaignApplies(campaign, card, network) {
        if (campaign.bankName !== card.bankName)
            return false;
        if (campaign.cardType && campaign.cardType !== card.cardType)
            return false;
        const requiredNetwork = this.extractRequiredNetwork(campaign);
        if (requiredNetwork && requiredNetwork !== network)
            return false;
        return true;
    }
    extractRequiredNetwork(campaign) {
        const haystack = `${campaign.title} ${campaign.description}`.toLowerCase();
        if (haystack.includes('mastercard'))
            return 'MASTERCARD';
        if (haystack.includes('visa'))
            return 'VISA';
        if (haystack.includes('troy'))
            return 'TROY';
        if (haystack.includes('amex') || haystack.includes('american express'))
            return 'AMEX';
        return null;
    }
    computeReward(campaign, amount) {
        const rate = Number(campaign.rewardRate);
        const cap = campaign.maxReward ? Number(campaign.maxReward) : Number.POSITIVE_INFINITY;
        const raw = (amount * rate) / 100;
        const value = Math.min(raw, cap);
        const rewardValueTL = this.toTL(campaign.rewardType, value);
        return {
            campaignId: campaign.id,
            title: campaign.title,
            rewardType: campaign.rewardType,
            rewardRate: rate,
            rewardValue: Number(value.toFixed(2)),
            rewardValueTL: Number(rewardValueTL.toFixed(2)),
            rewardUnit: this.unitFor(campaign.rewardType),
            description: campaign.description,
        };
    }
    toTL(rewardType, value) {
        switch (rewardType) {
            case client_1.RewardType.CASHBACK:
            case client_1.RewardType.DISCOUNT:
                return value;
            case client_1.RewardType.POINTS:
                return value;
            case client_1.RewardType.MILES:
                return value * 0.05;
            default:
                return 0;
        }
    }
    unitFor(rewardType) {
        switch (rewardType) {
            case client_1.RewardType.CASHBACK:
            case client_1.RewardType.DISCOUNT:
                return 'TL';
            case client_1.RewardType.POINTS:
                return 'puan';
            case client_1.RewardType.MILES:
                return 'mil';
            default:
                return '';
        }
    }
};
exports.CardScoringService = CardScoringService;
exports.CardScoringService = CardScoringService = CardScoringService_1 = __decorate([
    (0, common_1.Injectable)()
], CardScoringService);
//# sourceMappingURL=card-scoring.service.js.map