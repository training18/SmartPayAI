import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { TransactionStatus, RewardType } from '@prisma/client';
import { ScoredCard } from '../ai/card-scoring.service';

export interface SavingsBreakdownResult {
  cashbackEarned: number;
  discountAmount: number;
  pointsValue: number;
  installmentValue: number;
  totalSavedAmount: number;
}

@Injectable()
export class SavingsService {
  private readonly logger = new Logger(SavingsService.name);

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Centralized engine to compute realized savings in TRY for a transaction.
   *
   * Conversions:
   * - CASHBACK / DISCOUNT: 1:1 conversion to TRY.
   * - POINTS: 1:1 conversion to TRY (e.g. Chip-para, Worldpuan, MaxiPuan).
   * - MILES: 0.05 TRY value per mile.
   * - AI Routing Gain: Winner Total Savings - Average of all other cards' savings.
   *
   * Installment count / utility is NOT included in savings calculation.
   */
  calculateSavings(
    amount: number,
    winnerCard: ScoredCard,
    allCards: ScoredCard[],
  ): SavingsBreakdownResult {
    this.logger.debug(
      `Calculating savings for transaction amount: ${amount} TRY. Winner: ${winnerCard.bankName}`,
    );

    // 1. Calculate savings for the winner card
    const winnerMetrics = this.computeSingleCardSavings(amount, winnerCard);

    // 2. Calculate savings for all other cards to determine average baseline
    const otherCards = allCards.filter((c) => c.cardId !== winnerCard.cardId);
    let avgOtherSavings = 0;
    let aiRoutingGain = 0;

    if (otherCards.length > 0) {
      const sumOtherSavings = otherCards.reduce((sum, card) => {
        const metrics = this.computeSingleCardSavings(amount, card);
        return sum + metrics.totalSavedAmount;
      }, 0);
      avgOtherSavings = sumOtherSavings / otherCards.length;
      aiRoutingGain = Math.max(0, winnerMetrics.totalSavedAmount - avgOtherSavings);
    }

    const result = {
      ...winnerMetrics,
    };

    this.logger.debug(
      `Savings calculated: Total = ${result.totalSavedAmount} TRY (Cashback: ${result.cashbackEarned}, Discount: ${result.discountAmount}, Points: ${result.pointsValue})}`,
    );

    return result;
  }

  /**
   * Helper to compute savings for a single card candidate.
   */
  private computeSingleCardSavings(
    amount: number,
    card: ScoredCard,
  ): Omit<SavingsBreakdownResult, 'aiRoutingGain'> {
    let cashbackEarned = 0;
    let discountAmount = 0;
    let pointsValue = 0;

    const match = card.bestMatch;
    if (match) {
      const val = match.rewardValue;
      switch (match.rewardType) {
        case RewardType.CASHBACK:
          cashbackEarned = val;
          break;
        case RewardType.DISCOUNT:
          discountAmount = val;
          break;
        case RewardType.POINTS:
          pointsValue = val; // 1 point = 1 TRY
          break;
        case RewardType.MILES:
          pointsValue = val * 0.05; // 1 mile = 0.05 TRY
          break;
        default:
          break;
      }
    }

    const totalSavedAmount = cashbackEarned + discountAmount + pointsValue;

    return {
      cashbackEarned: Number(cashbackEarned.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      pointsValue: Number(pointsValue.toFixed(2)),
      installmentValue: 0,
      totalSavedAmount: Number(totalSavedAmount.toFixed(2)),
    };
  }

  /**
   * Fetch and aggregate a comprehensive savings dashboard for a specific user.
   */
  async getSavingsDashboard(userId: string) {
    // Only query COMPLETED or APPROVED transactions to avoid counting pending/rejected transactions
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        status: { in: [TransactionStatus.COMPLETED, TransactionStatus.APPROVED] },
      },
      include: {
        recommendation: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalSaved = 0;
    let todaySaved = 0;
    let weeklySaved = 0;
    let monthlySaved = 0;
    let totalCashback = 0;
    let totalRewardsValue = 0; // points + miles
    let totalRoutingGain = 0;

    const cardSavingsMap = new Map<string, { bankName: string; count: number; savings: number }>();
    const campaignSavingsMap = new Map<string, number>();
    const merchantSavingsMap = new Map<string, number>();
    const categorySavingsMap = new Map<string, number>();
    let optimizedCount = 0;

    for (const tx of transactions) {
      const rec = tx.recommendation;
      if (!rec) continue;

      const saved = Number(rec.totalSavedAmount);
      const cashback = Number(rec.cashbackEarned);
      const points = Number(rec.pointsValue);
      const routingGain = Number(rec.aiRoutingGain);

      totalSaved += saved;
      totalCashback += cashback;
      totalRewardsValue += points;
      totalRoutingGain += routingGain;

      const txDate = new Date(tx.createdAt);
      if (txDate >= todayStart) {
        todaySaved += saved;
      }
      if (txDate >= weekStart) {
        weeklySaved += saved;
      }
      if (txDate >= monthStart) {
        monthlySaved += saved;
      }

      if (routingGain > 0) {
        optimizedCount++;
      }

      // Aggregations by Card
      if (rec.recommendedCardId) {
        const cardKey = rec.recommendedCardId;
        const current = cardSavingsMap.get(cardKey) || {
          bankName: rec.recommendedBank,
          count: 0,
          savings: 0,
        };
        current.count++;
        current.savings += saved;
        cardSavingsMap.set(cardKey, current);
      }

      // Aggregations by Campaign
      // Extract campaign title from the reason or estimatedBenefit JSON if matches exist
      let campaignTitle = 'General Optimization';
      if (rec.campaignMatches) {
        const matches = rec.campaignMatches as any[];
        if (matches && matches.length > 0) {
          // Find the campaign match corresponding to the selected card's bestMatch
          campaignTitle = matches[0].title || campaignTitle;
        }
      }
      campaignSavingsMap.set(campaignTitle, (campaignSavingsMap.get(campaignTitle) || 0) + saved);

      // Aggregations by Merchant
      merchantSavingsMap.set(tx.merchantName, (merchantSavingsMap.get(tx.merchantName) || 0) + saved);

      // Aggregations by Category
      categorySavingsMap.set(
        rec.merchantCategory,
        (categorySavingsMap.get(rec.merchantCategory) || 0) + saved,
      );
    }

    // Determine Best Performing Card
    let bestCard = { bankName: 'N/A', savings: 0 };
    cardSavingsMap.forEach((v) => {
      if (v.savings > bestCard.savings) {
        bestCard = { bankName: v.bankName, savings: Number(v.savings.toFixed(2)) };
      }
    });

    // Determine Most Profitable Campaign
    let bestCampaign = { title: 'N/A', savings: 0 };
    campaignSavingsMap.forEach((v, k) => {
      if (v > bestCampaign.savings) {
        bestCampaign = { title: k, savings: Number(v.toFixed(2)) };
      }
    });

    // AI Success Rate
    const aiSuccessRate =
      transactions.length > 0 ? Math.round((optimizedCount / transactions.length) * 100) : 0;

    // Savings by Merchant format
    const savingsByMerchant = Array.from(merchantSavingsMap.entries())
      .map(([name, amount]) => ({ name, amount: Number(amount.toFixed(2)) }))
      .sort((a, b) => b.amount - a.amount);

    // Savings by Category format
    const savingsByCategory = Array.from(categorySavingsMap.entries())
      .map(([name, amount]) => ({ name, amount: Number(amount.toFixed(2)) }))
      .sort((a, b) => b.amount - a.amount);

    // Savings by Card format
    const savingsByCard = Array.from(cardSavingsMap.values())
      .map((c) => ({ name: c.bankName, amount: Number(c.savings.toFixed(2)) }))
      .sort((a, b) => b.amount - a.amount);

    // Trend Graphs: last 7 days daily savings
    const dailySavingsTrend: { label: string; amount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('tr-TR', { weekday: 'short' });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

      const dayTotal = transactions
        .filter((t) => {
          const date = new Date(t.createdAt);
          return date >= dayStart && date < dayEnd;
        })
        .reduce((sum, t) => sum + Number(t.recommendation?.totalSavedAmount ?? 0), 0);

      dailySavingsTrend.push({ label, amount: Number(dayTotal.toFixed(2)) });
    }

    // Annual Projection
    // Calculate daily average savings and project for 365 days
    let annualProjection = 0;
    if (transactions.length > 0) {
      const earliestTx = new Date(transactions[transactions.length - 1].createdAt);
      const daysDiff = Math.max(
        1,
        Math.ceil((now.getTime() - earliestTx.getTime()) / (1000 * 60 * 60 * 24)),
      );
      const dailyAverage = totalSaved / daysDiff;
      annualProjection = Number((dailyAverage * 365).toFixed(2));
    }

    return {
      summary: {
        totalSaved: Number(totalSaved.toFixed(2)),
        todaySaved: Number(todaySaved.toFixed(2)),
        weeklySaved: Number(weeklySaved.toFixed(2)),
        monthlySaved: Number(monthlySaved.toFixed(2)),
        aiSmartRoutingGain: Number(totalRoutingGain.toFixed(2)),
        cashbackEarned: Number(totalCashback.toFixed(2)),
        totalRewardsValue: Number(totalRewardsValue.toFixed(2)),
        bestPerformingCard: bestCard.bankName,
        mostProfitableCampaign: bestCampaign.title,
        aiOptimizationSuccessRate: aiSuccessRate,
        estimatedAnnualSavingsProjection: annualProjection,
      },
      trends: dailySavingsTrend,
      analytics: {
        byMerchant: savingsByMerchant,
        byCategory: savingsByCategory,
        byCard: savingsByCard,
      },
      history: transactions.slice(0, 10).map((tx) => ({
        id: tx.id,
        merchantName: tx.merchantName,
        amount: Number(tx.amount),
        currency: tx.currency,
        date: tx.createdAt,
        totalSavedAmount: Number(tx.recommendation?.totalSavedAmount ?? 0),
        cashbackEarned: Number(tx.recommendation?.cashbackEarned ?? 0),
        discountAmount: Number(tx.recommendation?.discountAmount ?? 0),
        pointsValue: Number(tx.recommendation?.pointsValue ?? 0),
        installmentValue: Number(tx.recommendation?.installmentValue ?? 0),
        aiRoutingGain: Number(tx.recommendation?.aiRoutingGain ?? 0),
        recommendedBank: tx.recommendation?.recommendedBank ?? 'N/A',
        merchantCategory: tx.recommendation?.merchantCategory ?? 'grocery',
      })),
    };
  }

  /**
   * Generates a rich set of mock cards, completed transactions, and savings metrics
   * for a specific user to showcase the savings dashboard.
   */
  async seedMockData(userId: string) {
    this.logger.log(`Generating mock savings data for user: ${userId}`);

    // 1. Ensure user has mock saved cards to associate with transaction recommendations
    let cards = await this.prisma.savedCard.findMany({ where: { userId } });
    if (cards.length === 0) {
      cards = [
        await this.prisma.savedCard.create({
          data: {
            userId,
            bankName: 'Garanti BBVA',
            cardType: 'CREDIT',
            first4: '5412',
            cardAlias: 'Bonus Card',
            rewardType: 'CASHBACK',
          },
        }),
        await this.prisma.savedCard.create({
          data: {
            userId,
            bankName: 'Yapı Kredi',
            cardType: 'CREDIT',
            first4: '4111',
            cardAlias: 'World Card',
            rewardType: 'POINTS',
          },
        }),
        await this.prisma.savedCard.create({
          data: {
            userId,
            bankName: 'Akbank',
            cardType: 'CREDIT',
            first4: '5520',
            cardAlias: 'Axess',
            rewardType: 'INSTALLMENT',
          },
        }),
        await this.prisma.savedCard.create({
          data: {
            userId,
            bankName: 'İş Bankası',
            cardType: 'CREDIT',
            first4: '4543',
            cardAlias: 'Maximum',
            rewardType: 'POINTS',
          },
        }),
      ];
    }

    // 2. Clear existing transactions for this user to make it clean & reproducible
    await this.prisma.transaction.deleteMany({ where: { userId } });

    // 3. Define 10 realistic historical completed transactions
    const mockTxs = [
      {
        merchantName: 'Migros',
        category: 'grocery',
        amount: 1500,
        daysAgo: 0,
        cardIndex: 0, // Garanti BBVA
        campaignTitle: 'Migros %5 Cashback',
        savings: {
          cashbackEarned: 75.0,
          discountAmount: 0,
          pointsValue: 0,
          installmentValue: 0,
          aiRoutingGain: 45.0,
          totalSavedAmount: 75.0,
        },
        estimatedBenefit: '75.00 TL cashback',
        reason: 'Garanti BBVA kartınız Migros %5 nakit iade kampanyası için seçildi. En yakın alternatif karta göre 45.00 TL daha karlı.',
      },
      {
        merchantName: 'Starbucks',
        category: 'coffee',
        amount: 250,
        daysAgo: 1,
        cardIndex: 2, // Akbank
        campaignTitle: 'Kahve %10 Cashback',
        savings: {
          cashbackEarned: 25.0,
          discountAmount: 0,
          pointsValue: 0,
          installmentValue: 0,
          aiRoutingGain: 25.0,
          totalSavedAmount: 25.0,
        },
        estimatedBenefit: '25.00 TL cashback',
        reason: 'Akbank Axess kartınız kahve harcamalarında %10 iade kampanyası ile en yüksek kazancı sağladı.',
      },
      {
        merchantName: 'MediaMarkt',
        category: 'electronics',
        amount: 6000,
        daysAgo: 2,
        cardIndex: 3, // İş Bankası
        campaignTitle: 'Teknoloji %4 Cashback',
        savings: {
          cashbackEarned: 240.0,
          discountAmount: 0,
          pointsValue: 0,
          installmentValue: 0,
          aiRoutingGain: 240.0,
          totalSavedAmount: 240.0,
        },
        estimatedBenefit: '240.00 TL cashback',
        reason: 'İş Bankası Maximum kartınızın %4 nakit iade kampanyası ile elektronik harcamanızda 240.00 TL tasarruf sağlandı.',
      },
      {
        merchantName: 'Shell',
        category: 'fuel',
        amount: 1800,
        daysAgo: 3,
        cardIndex: 0, // Garanti BBVA
        campaignTitle: 'Akaryakıt %7 İndirim',
        savings: {
          cashbackEarned: 0,
          discountAmount: 126.0,
          pointsValue: 0,
          installmentValue: 0,
          aiRoutingGain: 126.0,
          totalSavedAmount: 126.0,
        },
        estimatedBenefit: '126.00 TL indirim',
        reason: 'Garanti BBVA Bonus kartınız akaryakıt istasyonlarında %7 indirim avantajıyla öne çıktı.',
      },
      {
        merchantName: 'Burger King',
        category: 'restaurant',
        amount: 400,
        daysAgo: 4,
        cardIndex: 3, // İş Bankası
        campaignTitle: 'Restoran %5 Puan',
        savings: {
          cashbackEarned: 0,
          discountAmount: 0,
          pointsValue: 20.0,
          installmentValue: 0,
          aiRoutingGain: 20.0,
          totalSavedAmount: 20.0,
        },
        estimatedBenefit: '20.00 MaxiPuan',
        reason: 'İş Bankası Maximum kartınız restoran harcamanızda %5 MaxiPuan kazandırdı.',
      },
      {
        merchantName: 'Zara',
        category: 'clothing',
        amount: 2500,
        daysAgo: 5,
        cardIndex: 1, // Yapı Kredi
        campaignTitle: 'Market Alışverişinde %3 Puan',
        savings: {
          cashbackEarned: 0,
          discountAmount: 0,
          pointsValue: 75.0,
          installmentValue: 0,
          aiRoutingGain: 75.0,
          totalSavedAmount: 75.0,
        },
        estimatedBenefit: '75.00 Worldpuan',
        reason: 'Yapı Kredi World kartınız giyim harcamanızda %3 Worldpuan kazandırdı.',
      },
      {
        merchantName: 'Pegasus',
        category: 'travel',
        amount: 5000,
        daysAgo: 6,
        cardIndex: 1, // Yapı Kredi
        campaignTitle: 'Seyahat 5x Mil',
        savings: {
          cashbackEarned: 0,
          discountAmount: 0,
          pointsValue: 12.5,
          installmentValue: 0,
          aiRoutingGain: 12.5,
          totalSavedAmount: 12.5,
        },
        estimatedBenefit: '250 mil',
        reason: 'Yapı Kredi World kartınız uçak bileti harcamanızda 5 kat mil kazandırdı.',
      },
      {
        merchantName: 'Hepsiburada',
        category: 'shopping',
        amount: 3000,
        daysAgo: 6,
        cardIndex: 3, // İş Bankası
        campaignTitle: 'Online Alışveriş %3 Cashback',
        savings: {
          cashbackEarned: 90.0,
          discountAmount: 0,
          pointsValue: 0,
          installmentValue: 0,
          aiRoutingGain: 90.0,
          totalSavedAmount: 90.0,
        },
        estimatedBenefit: '90.00 TL cashback',
        reason: 'İş Bankası Maximum kartınız tüm online alışverişlerde %3 nakit iade sağladı.',
      },
      {
        merchantName: 'Macrocenter',
        category: 'grocery',
        amount: 2000,
        daysAgo: 6,
        cardIndex: 0, // Garanti BBVA
        campaignTitle: 'Migros %5 Cashback',
        savings: {
          cashbackEarned: 100.0,
          discountAmount: 0,
          pointsValue: 0,
          installmentValue: 0,
          aiRoutingGain: 100.0,
          totalSavedAmount: 100.0,
        },
        estimatedBenefit: '100.00 TL cashback',
        reason: 'Garanti BBVA Bonus kartınız Macrocenter market harcamanızda %5 nakit iade sağladı.',
      },
      {
        merchantName: 'Nero Cafe',
        category: 'coffee',
        amount: 150,
        daysAgo: 6,
        cardIndex: 2, // Akbank
        campaignTitle: 'Kahve %10 Cashback',
        savings: {
          cashbackEarned: 15.0,
          discountAmount: 0,
          pointsValue: 0,
          installmentValue: 0,
          aiRoutingGain: 15.0,
          totalSavedAmount: 15.0,
        },
        estimatedBenefit: '15.00 TL cashback',
        reason: 'Akbank Axess kartınız kahve alımınızda %10 nakit iade kazandırdı.',
      },
    ];

    for (const mock of mockTxs) {
      const card = cards[mock.cardIndex];
      const txDate = new Date();
      txDate.setDate(txDate.getDate() - mock.daysAgo);

      const tx = await this.prisma.transaction.create({
        data: {
          userId,
          merchantName: mock.merchantName,
          amount: mock.amount,
          currency: 'TRY',
          status: TransactionStatus.COMPLETED,
          createdAt: txDate,
        },
      });

      await this.prisma.recommendation.create({
        data: {
          transactionId: tx.id,
          recommendedCardId: card.id,
          merchantCategory: mock.category,
          recommendedBank: card.bankName,
          recommendedNetwork: 'Mastercard',
          reason: mock.reason,
          estimatedBenefit: mock.estimatedBenefit,
          confidence: 0.95,
          cashbackEarned: mock.savings.cashbackEarned,
          discountAmount: mock.savings.discountAmount,
          pointsValue: mock.savings.pointsValue,
          installmentValue: mock.savings.installmentValue,
          aiRoutingGain: mock.savings.aiRoutingGain,
          totalSavedAmount: mock.savings.totalSavedAmount,
          createdAt: txDate,
          campaignMatches: [
            {
              campaignId: 'mock-camp',
              title: mock.campaignTitle,
              bankName: card.bankName,
              rewardRate: 5.0,
              rewardValue: mock.savings.totalSavedAmount,
              rewardUnit: 'TL',
            },
          ] as any,
        },
      });
    }

    return { success: true, count: mockTxs.length };
  }
}
