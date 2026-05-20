import { Injectable, Logger } from '@nestjs/common';
import type { ScoredCard, CampaignMatch } from './card-scoring.service';

/**
 * Simulated smart-routing engine.
 *
 * Takes the deterministic scoring output + the AI's chosen card and produces
 * the structured routing trace persisted on the Recommendation row. No real
 * funds are moved — this is the "Curve / Privacy.com"-style orchestration
 * layer that the demo logs back to the mobile app.
 */

export interface SavingsBreakdown {
  /** Primary reward value (e.g. 120). */
  value: number;
  /** Display unit (e.g. "TL", "puan"). */
  unit: string;
  /** Reward kind (CASHBACK / POINTS / MILES / DISCOUNT). */
  type: string;
}

export interface RejectedCardEntry {
  cardId: string;
  bankName: string;
  network: string;
  /** Why this card was not picked, expressed for the end user. */
  reason: string;
  /** Best reward this card could have produced, for transparency. */
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

@Injectable()
export class RoutingSimulationService {
  private readonly logger = new Logger(RoutingSimulationService.name);

  /**
   * Build a routing plan from the scored candidate set + the AI's pick.
   *
   * If the AI picked a card that no longer exists (or scoring was empty)
   * the top-scored card is used as a deterministic fallback so the demo
   * never logs an inconsistent routing decision.
   */
  buildPlan(args: {
    scored: ScoredCard[];
    aiSelectedCardId: string | null;
    aiRewardBreakdown?: { type: string; value: number; unit: string } | null;
  }): RoutingPlan {
    const { scored, aiSelectedCardId, aiRewardBreakdown } = args;

    const selected =
      scored.find((s) => s.cardId === aiSelectedCardId) ?? scored[0];
    if (!selected) {
      throw new Error('RoutingSimulation: no scored cards to route');
    }

    const rejected = scored
      .filter((s) => s.cardId !== selected.cardId)
      .map((s) => this.toRejectedEntry(s, selected));

    const matches = selected.matches.map<CampaignMatchEntry>((m) => ({
      campaignId: m.campaignId,
      title: m.title,
      bankName: selected.bankName,
      rewardRate: m.rewardRate,
      rewardValue: m.rewardValue,
      rewardUnit: m.rewardUnit,
    }));

    const breakdown = this.resolveBreakdown(selected.bestMatch, aiRewardBreakdown);

    const plan: RoutingPlan = {
      selectedCardId: selected.cardId,
      selectedBank: selected.bankName,
      selectedNetwork: selected.networkLabel,
      savingsBreakdown: breakdown,
      rejectedCards: rejected,
      campaignMatches: matches,
      routedAt: new Date().toISOString(),
    };

    this.logger.log(
      `[Routing] ${selected.bankName} (${selected.networkLabel}) selected · ` +
        `gain=${breakdown.value} ${breakdown.unit} · rejected=${rejected.length}`,
    );

    return plan;
  }

  /** Compose the per-rejected-card reason line. */
  private toRejectedEntry(card: ScoredCard, winner: ScoredCard): RejectedCardEntry {
    const winnerValue = winner.bestMatch?.rewardValue ?? 0;
    const winnerUnit = winner.bestMatch?.rewardUnit ?? '';
    const forfeited = card.bestMatch?.rewardValue ?? 0;
    const forfeitedUnit = card.bestMatch?.rewardUnit ?? '';

    let reason: string;
    if (!card.bestMatch) {
      reason = `No active campaign matches this card for the merchant category.`;
    } else if (forfeitedUnit !== winnerUnit) {
      reason = `Offers ${forfeited} ${forfeitedUnit}, but ${winner.bankName} returns ${winnerValue} ${winnerUnit} which is more valuable.`;
    } else {
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

  /** Prefer the AI's structured breakdown when present, else fall back. */
  private resolveBreakdown(
    bestMatch: CampaignMatch | null,
    aiBreakdown?: { type: string; value: number; unit: string } | null,
  ): SavingsBreakdown {
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
}
