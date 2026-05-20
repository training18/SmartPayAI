import { Injectable, Logger } from '@nestjs/common';
import { Prisma, RewardType, CardType } from '@prisma/client';
import { detectCardNetwork, CardNetwork } from '../saved-cards/utils/card-network.util';

/**
 * Deterministic card scoring engine — pure reward optimization.
 *
 * Sits between the raw {cards, campaigns} input and the LLM. For each user
 * card we identify the campaigns it actually qualifies for (bank + category +
 * card type + optional network filter parsed from the campaign description)
 * and compute the expected reward value normalized to TL.
 *
 * The AI then chooses between structured candidates instead of doing
 * arithmetic on its own.
 *
 * Scoring is based exclusively on measurable monetary rewards:
 * cashback, bank reward points, miles, chip-para, MaxiPuan, Worldpuan,
 * bonus rewards, and campaign-based earnings.
 *
 * Installment count / installment utility is NOT part of the scoring.
 */

type SavedCardRow = Prisma.SavedCardGetPayload<Record<string, never>>;
type CampaignRow = Prisma.CampaignGetPayload<Record<string, never>>;

export interface CampaignMatch {
  campaignId: string;
  title: string;
  rewardType: RewardType;
  rewardRate: number;
  /** Computed reward value for this transaction, capped by maxReward. */
  rewardValue: number;
  /** Reward value normalized to TL equivalent for deterministic comparison. */
  rewardValueTL: number;
  /** Display unit: "TL" for cashback/discount; "puan" for points; "mil" for miles. */
  rewardUnit: string;
  description: string;
}

export interface ScoredCard {
  cardId: string;
  bankName: string;
  cardType: CardType;
  first4: string;
  network: CardNetwork;
  networkLabel: string;
  cardAlias: string | null;
  rewardType: RewardType;
  /** Best matched campaign (highest rewardValueTL). Null if none. */
  bestMatch: CampaignMatch | null;
  /** All qualifying campaigns, sorted by rewardValueTL desc. */
  matches: CampaignMatch[];
  /** Aggregate score (TL-normalized) used as deterministic tiebreaker. */
  score: number;
}

@Injectable()
export class CardScoringService {
  private readonly logger = new Logger(CardScoringService.name);

  /**
   * Score every user card against the active campaign set.
   *
   * Returns the full list ordered by `score` descending so the AI sees the
   * strongest candidate first.
   */
  scoreCards(cards: SavedCardRow[], campaigns: CampaignRow[], amount: number): ScoredCard[] {
    const scored = cards.map((card) => this.scoreSingleCard(card, campaigns, amount));
    scored.sort((a, b) => b.score - a.score);
    this.logger.debug(
      `Scored ${scored.length} cards — top: ${scored[0]?.bankName} (score=${scored[0]?.score.toFixed(2)} TL)`,
    );
    return scored;
  }

  private scoreSingleCard(card: SavedCardRow, campaigns: CampaignRow[], amount: number): ScoredCard {
    const net = detectCardNetwork(card.first4);

    const matches: CampaignMatch[] = campaigns
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

  /**
   * Decide whether a campaign applies to a given card.
   *
   * Bank + cardType are matched strictly. Network is matched only when the
   * campaign explicitly mentions a network in its title/description — this
   * keeps generic bank-wide campaigns matching all cards from that bank.
   */
  private campaignApplies(campaign: CampaignRow, card: SavedCardRow, network: CardNetwork): boolean {
    if (campaign.bankName !== card.bankName) return false;
    if (campaign.cardType && campaign.cardType !== card.cardType) return false;

    const requiredNetwork = this.extractRequiredNetwork(campaign);
    if (requiredNetwork && requiredNetwork !== network) return false;

    return true;
  }

  /** Parse a network constraint out of the campaign copy (heuristic). */
  private extractRequiredNetwork(campaign: CampaignRow): CardNetwork | null {
    const haystack = `${campaign.title} ${campaign.description}`.toLowerCase();
    if (haystack.includes('mastercard')) return 'MASTERCARD';
    if (haystack.includes('visa')) return 'VISA';
    if (haystack.includes('troy')) return 'TROY';
    if (haystack.includes('amex') || haystack.includes('american express')) return 'AMEX';
    return null;
  }

  /**
   * Compute the realized reward for an amount against a campaign.
   *
   * All reward types are normalized to a TL-equivalent value:
   * - CASHBACK / DISCOUNT → 1:1 TL
   * - POINTS (chip-para, MaxiPuan, Worldpuan, bonus) → 1 point = 1 TL
   * - MILES → 1 mile = 0.05 TL
   * - INSTALLMENT / NONE → 0 TL (not a measurable reward)
   */
  private computeReward(campaign: CampaignRow, amount: number): CampaignMatch {
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

  /**
   * Normalize a reward value to TL equivalent.
   */
  private toTL(rewardType: RewardType, value: number): number {
    switch (rewardType) {
      case RewardType.CASHBACK:
      case RewardType.DISCOUNT:
        return value; // 1:1 TL
      case RewardType.POINTS:
        return value; // 1 point = 1 TL (MaxiPuan, Worldpuan, chip-para)
      case RewardType.MILES:
        return value * 0.05; // 1 mile = 0.05 TL
      default:
        return 0; // INSTALLMENT, NONE — no measurable reward
    }
  }

  private unitFor(rewardType: RewardType): string {
    switch (rewardType) {
      case RewardType.CASHBACK:
      case RewardType.DISCOUNT:
        return 'TL';
      case RewardType.POINTS:
        return 'puan';
      case RewardType.MILES:
        return 'mil';
      default:
        return '';
    }
  }
}
