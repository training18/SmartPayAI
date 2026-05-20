import { SavingsService } from './savings.service';
import { PrismaService } from '../prisma';
import { RewardType, CardType } from '@prisma/client';
import { ScoredCard } from '../ai/card-scoring.service';

describe('SavingsService', () => {
  let service: SavingsService;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = {} as any; // Mock Prisma
    service = new SavingsService(prisma);
  });

  describe('calculateSavings', () => {
    it('should calculate direct cashback and routing gain correctly', () => {
      const amount = 5000;
      
      const winner: ScoredCard = {
        cardId: 'card-a',
        bankName: 'Garanti BBVA',
        cardType: CardType.CREDIT,
        first4: '5412',
        network: 'MASTERCARD',
        networkLabel: 'Mastercard',
        cardAlias: 'Bonus Card',
        rewardType: RewardType.CASHBACK,
        score: 500,
        bestMatch: {
          campaignId: 'camp-1',
          title: 'Migros %10 Cashback',
          rewardType: RewardType.CASHBACK,
          rewardRate: 10,
          rewardValue: 500,
          rewardValueTL: 500,
          rewardUnit: 'TL',
          description: 'Migros %10 cashback',
        },
        matches: [],
      };

      const other: ScoredCard = {
        cardId: 'card-b',
        bankName: 'Yapı Kredi',
        cardType: CardType.CREDIT,
        first4: '4111',
        network: 'VISA',
        networkLabel: 'Visa',
        cardAlias: 'World Card',
        rewardType: RewardType.POINTS,
        score: 100,
        bestMatch: {
          campaignId: 'camp-2',
          title: 'Migros 100 TRY Worldpuan',
          rewardType: RewardType.POINTS,
          rewardRate: 0,
          rewardValue: 100,
          rewardValueTL: 100,
          rewardUnit: 'puan',
          description: '100 Worldpuan',
        },
        matches: [],
      };

      const result = service.calculateSavings(amount, winner, [winner, other]);

      expect(result.cashbackEarned).toBe(500);
      expect(result.pointsValue).toBe(0);
      expect(result.installmentValue).toBe(0);
      expect(result.totalSavedAmount).toBe(500);
    });

    it('should calculate miles value correctly with TL conversion', () => {
      const amount = 5000;
      
      const winner: ScoredCard = {
        cardId: 'card-a',
        bankName: 'Yapı Kredi',
        cardType: CardType.CREDIT,
        first4: '4111',
        network: 'VISA',
        networkLabel: 'Visa',
        cardAlias: 'World Card',
        rewardType: RewardType.MILES,
        score: 12.5,
        bestMatch: {
          campaignId: 'camp-3',
          title: 'Seyahat 5x Mil',
          rewardType: RewardType.MILES,
          rewardRate: 5,
          rewardValue: 250,
          rewardValueTL: 12.5,
          rewardUnit: 'mil',
          description: '5x mil',
        },
        matches: [],
      };

      const result = service.calculateSavings(amount, winner, [winner]);

      expect(result.cashbackEarned).toBe(0);
      // 250 miles * 0.05 = 12.5 TRY
      expect(result.pointsValue).toBe(12.5);
      expect(result.installmentValue).toBe(0);
      expect(result.totalSavedAmount).toBe(12.5);
    });

    it('should produce zero savings for installment-only campaigns', () => {
      const amount = 5000;
      
      const winner: ScoredCard = {
        cardId: 'card-b',
        bankName: 'Akbank',
        cardType: CardType.CREDIT,
        first4: '5520',
        network: 'MASTERCARD',
        networkLabel: 'Mastercard',
        cardAlias: 'Axess',
        rewardType: RewardType.INSTALLMENT,
        score: 0,
        bestMatch: {
          campaignId: 'camp-4',
          title: '12 Taksit Kampanyası',
          rewardType: RewardType.INSTALLMENT,
          rewardRate: 0,
          rewardValue: 0,
          rewardValueTL: 0,
          rewardUnit: '',
          description: '12 Taksit',
        },
        matches: [],
      };

      const result = service.calculateSavings(amount, winner, [winner]);

      expect(result.cashbackEarned).toBe(0);
      expect(result.pointsValue).toBe(0);
      expect(result.installmentValue).toBe(0);
      expect(result.totalSavedAmount).toBe(0);
    });
  });
});
