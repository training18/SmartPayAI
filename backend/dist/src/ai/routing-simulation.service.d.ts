import type { ScoredCard } from './card-scoring.service';
export interface SavingsBreakdown {
    value: number;
    unit: string;
    type: string;
}
export interface RejectedCardEntry {
    cardId: string;
    bankName: string;
    network: string;
    reason: string;
    forfeitedValue: number;
    forfeitedUnit: string;
}
export interface CampaignMatchEntry {
    campaignId: string;
    title: string;
    bankName: string;
    rewardRate: number;
    rewardValue: number;
    rewardUnit: string;
}
export interface RoutingPlan {
    selectedCardId: string;
    selectedBank: string;
    selectedNetwork: string;
    savingsBreakdown: SavingsBreakdown;
    rejectedCards: RejectedCardEntry[];
    campaignMatches: CampaignMatchEntry[];
    routedAt: string;
}
export declare class RoutingSimulationService {
    private readonly logger;
    buildPlan(args: {
        scored: ScoredCard[];
        aiSelectedCardId: string | null;
        aiRewardBreakdown?: {
            type: string;
            value: number;
            unit: string;
        } | null;
    }): RoutingPlan;
    private toRejectedEntry;
    private resolveBreakdown;
}
