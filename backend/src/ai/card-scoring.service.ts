import { Injectable, Logger } from '@nestjs/common';
import { Prisma, RewardType, CardType } from '@prisma/client';
import { detectCardNetwork, CardNetwork } from '../saved-cards/utils/card-network.util';

/**
 * Deterministic card scoring engine.
 *
 * Sits between the raw {cards, campaigns} input and the LLM. For each user
 * card we identify the campaigns it actually qualifies for (bank + category +
 * card type + optional network filter parsed from the campaign description)
 * and compute the expected reward value. The AI then chooses between
 * structured candidates instead of doing arithmetic on its own.
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
  /** Display unit: "TL" for cashback/discount; "points"/"miles" otherwise. */
  rewardUnit: string;
  installmentCount: number | null;
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
  /** Best matched campaign (highest expectedRewardValue). Null if none. */
  bestMatch: CampaignMatch | null;
  /** All qualifying campaigns, sorted by expected reward desc. */
  matches: CampaignMatch[];
  /** Aggregate score used as deterministic tiebreaker. */
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
      `Scored ${scored.length} cards — top: ${scored[0]?.bankName} (score=${scored[0]?.score.toFixed(2)})`,
    );
    return scored;
  }

  private scoreSingleCard(card: SavedCardRow, campaigns: CampaignRow[], amount: number): ScoredCard {
    const net = detectCardNetwork(card.first4);

    const matches: CampaignMatch[] = campaigns
      .filter((c) => this.campaignApplies(c, card, net.network))
      .map((c) => this.computeReward(c, amount))
      .sort((a, b) => b.rewardValue - a.rewardValue);

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
      score: best?.rewardValue ?? 0,
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

  /** Compute the realized reward for an amount against a campaign. */
  private computeReward(campaign: CampaignRow, amount: number): CampaignMatch {
    const rate = Number(campaign.rewardRate);
    const cap = campaign.maxReward ? Number(campaign.maxReward) : Number.POSITIVE_INFINITY;
    const raw = (amount * rate) / 100;
    const value = Math.min(raw, cap);

    return {
      campaignId: campaign.id,
      title: campaign.title,
      rewardType: campaign.rewardType,
      rewardRate: rate,
      rewardValue: Number(value.toFixed(2)),
      rewardUnit: this.unitFor(campaign.rewardType),
      installmentCount: campaign.installmentCount,
      description: campaign.description,
    };
  }

  private unitFor(rewardType: RewardType): string {
    switch (rewardType) {
      case RewardType.CASHBACK:
      case RewardType.DISCOUNT:
        return 'TL';
      case RewardType.POINTS:
        return 'points';
      case RewardType.MILES:
        return 'miles';
      case RewardType.INSTALLMENT:
        return 'installments';
      default:
        return '';
    }
  }
}
