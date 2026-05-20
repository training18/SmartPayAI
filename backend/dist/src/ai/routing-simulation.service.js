"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RoutingSimulationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutingSimulationService = void 0;
const common_1 = require("@nestjs/common");
let RoutingSimulationService = RoutingSimulationService_1 = class RoutingSimulationService {
    logger = new common_1.Logger(RoutingSimulationService_1.name);
    buildPlan(args) {
        const { scored, aiSelectedCardId, aiRewardBreakdown } = args;
        const selected = scored.find((s) => s.cardId === aiSelectedCardId) ?? scored[0];
        if (!selected) {
            throw new Error('RoutingSimulation: no scored cards to route');
        }
        const rejected = scored
            .filter((s) => s.cardId !== selected.cardId)
            .map((s) => this.toRejectedEntry(s, selected));
        const matches = selected.matches.map((m) => ({
            campaignId: m.campaignId,
            title: m.title,
            bankName: selected.bankName,
            rewardRate: m.rewardRate,
            rewardValue: m.rewardValue,
            rewardUnit: m.rewardUnit,
        }));
        const breakdown = this.resolveBreakdown(selected.bestMatch, aiRewardBreakdown);
        const plan = {
            selectedCardId: selected.cardId,
            selectedBank: selected.bankName,
            selectedNetwork: selected.networkLabel,
            savingsBreakdown: breakdown,
            rejectedCards: rejected,
            campaignMatches: matches,
            routedAt: new Date().toISOString(),
        };
        this.logger.log(`[Routing] ${selected.bankName} (${selected.networkLabel}) selected · ` +
            `gain=${breakdown.value} ${breakdown.unit} · rejected=${rejected.length}`);
        return plan;
    }
    toRejectedEntry(card, winner) {
        const winnerValue = winner.bestMatch?.rewardValue ?? 0;
        const winnerUnit = winner.bestMatch?.rewardUnit ?? '';
        const forfeited = card.bestMatch?.rewardValue ?? 0;
        const forfeitedUnit = card.bestMatch?.rewardUnit ?? '';
        let reason;
        if (!card.bestMatch) {
            reason = `No active campaign matches this card for the merchant category.`;
        }
        else if (forfeitedUnit !== winnerUnit) {
            reason = `Offers ${forfeited} ${forfeitedUnit}, but ${winner.bankName} returns ${winnerValue} ${winnerUnit} which is more valuable.`;
        }
        else {
            const delta = (winnerValue - forfeited).toFixed(2);
            reason = `Returns ${forfeited} ${forfeitedUnit} — ${winner.bankName} beats it by ${delta} ${winnerUnit}.`;
        }
        return {
            cardId: card.cardId,
            bankName: card.bankName,
            network: card.networkLabel,
            reason,
            forfeitedValue: forfeited,
            forfeitedUnit,
        };
    }
    resolveBreakdown(bestMatch, aiBreakdown) {
        if (aiBreakdown && typeof aiBreakdown.value === 'number') {
            return {
                type: aiBreakdown.type,
                value: aiBreakdown.value,
                unit: aiBreakdown.unit,
            };
        }
        if (bestMatch) {
            return {
                type: bestMatch.rewardType,
                value: bestMatch.rewardValue,
                unit: bestMatch.rewardUnit,
            };
        }
        return { type: 'NONE', value: 0, unit: '' };
    }
};
exports.RoutingSimulationService = RoutingSimulationService;
exports.RoutingSimulationService = RoutingSimulationService = RoutingSimulationService_1 = __decorate([
    (0, common_1.Injectable)()
], RoutingSimulationService);
//# sourceMappingURL=routing-simulation.service.js.map