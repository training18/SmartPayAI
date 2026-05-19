import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { MerchantIntelligenceService } from '../ai/merchant-intelligence.service';
import { CardRecommendationService } from '../ai/card-recommendation.service';
import { VirtualCardsService } from '../virtual-cards/virtual-cards.service';
import { InitiateTransactionDto } from './dto';
import { TransactionStatus, Prisma } from '@prisma/client';

/**
 * Transaction service — orchestrates the complete demo payment flow:
 *
 * 1. Initiate: validate → AI merchant analysis → AI card recommendation → save PENDING
 * 2. Approve: deduct virtual balance → finalize as COMPLETED
 * 3. Reject: mark as REJECTED
 */
@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly merchantIntel: MerchantIntelligenceService,
    private readonly cardRecommendation: CardRecommendationService,
    private readonly virtualCards: VirtualCardsService,
  ) {}

  /**
   * STEP 1: Initiate a payment — runs the full AI pipeline.
   *
   * Creates a PENDING transaction with an AI recommendation attached.
   * Returns the recommendation for the user to approve/reject.
   */
  async initiate(userId: string, dto: InitiateTransactionDto) {
    const currency = dto.currency ?? 'TRY';

    // 1. Validate virtual card balance
    const virtualCard = await this.virtualCards.getByUserId(userId);
    if (!virtualCard) {
      throw new BadRequestException('No virtual card found. Please contact support.');
    }
    if (Number(virtualCard.balance) < dto.amount) {
      throw new BadRequestException(
        `Insufficient virtual card balance. Available: ${virtualCard.balance} ${currency}`,
      );
    }

    // 2. AI: Analyze merchant
    this.logger.log(`[Initiate] Analyzing merchant: ${dto.merchantName}`);
    const merchantAnalysis = await this.merchantIntel.analyze(dto.merchantName, dto.mcc);

    // 3. AI: Recommend best card
    this.logger.log(`[Initiate] Generating recommendation for category: ${merchantAnalysis.merchantCategory}`);
    const recommendation = await this.cardRecommendation.recommend(
      userId,
      dto.merchantName,
      merchantAnalysis.merchantCategory,
      dto.amount,
      currency,
    );

    // 4. Create PENDING transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        merchantId: merchantAnalysis.merchantId,
        merchantName: dto.merchantName,
        amount: dto.amount,
        currency,
        description: dto.description,
        mcc: dto.mcc,
        status: TransactionStatus.PENDING,
      },
    });

    // 5. Create recommendation record
    const rec = await this.prisma.recommendation.create({
      data: {
        transactionId: transaction.id,
        recommendedCardId: recommendation.recommendedCardId,
        merchantCategory: merchantAnalysis.merchantCategory,
        recommendedBank: recommendation.recommendedBank,
        reason: recommendation.reason,
        estimatedBenefit: recommendation.estimatedBenefit,
        confidence: recommendation.confidence,
        aiRawResponse: recommendation as unknown as Prisma.InputJsonValue,
      },
    });

    this.logger.log(
      `[Initiate] Transaction ${transaction.id} created (PENDING) — AI recommends: ${recommendation.recommendedBank}`,
    );

    return {
      transaction: {
        id: transaction.id,
        merchantName: transaction.merchantName,
        amount: Number(transaction.amount),
        currency: transaction.currency,
        status: transaction.status,
        createdAt: transaction.createdAt,
      },
      merchantAnalysis: {
        category: merchantAnalysis.merchantCategory,
        spendingType: merchantAnalysis.spendingType,
      },
      recommendation: {
        id: rec.id,
        recommendedBank: rec.recommendedBank,
        recommendedCardId: rec.recommendedCardId,
        reason: rec.reason,
        estimatedBenefit: rec.estimatedBenefit,
        confidence: Number(rec.confidence),
      },
    };
  }

  /**
   * STEP 2: Approve a pending transaction.
   *
   * Deducts from virtual card balance and marks as COMPLETED.
   */
  async approve(userId: string, transactionId: string) {
    const transaction = await this.getOwnedTransaction(userId, transactionId);

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException(`Transaction is already ${transaction.status.toLowerCase()}`);
    }

    // Deduct virtual card balance
    await this.virtualCards.deductBalance(userId, Number(transaction.amount));

    // Finalize transaction
    const updated = await this.prisma.transaction.update({
      where: { id: transactionId },
      data: { status: TransactionStatus.COMPLETED },
      include: { recommendation: true },
    });

    this.logger.log(`[Approve] Transaction ${transactionId} COMPLETED`);

    return {
      transaction: {
        id: updated.id,
        merchantName: updated.merchantName,
        amount: Number(updated.amount),
        currency: updated.currency,
        status: updated.status,
        updatedAt: updated.updatedAt,
      },
      recommendation: updated.recommendation
        ? {
            recommendedBank: updated.recommendation.recommendedBank,
            reason: updated.recommendation.reason,
            estimatedBenefit: updated.recommendation.estimatedBenefit,
          }
        : null,
      message: 'Payment completed successfully!',
    };
  }

  /**
   * STEP 3: Reject a pending transaction.
   */
  async reject(userId: string, transactionId: string) {
    const transaction = await this.getOwnedTransaction(userId, transactionId);

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException(`Transaction is already ${transaction.status.toLowerCase()}`);
    }

    const updated = await this.prisma.transaction.update({
      where: { id: transactionId },
      data: { status: TransactionStatus.REJECTED },
    });

    this.logger.log(`[Reject] Transaction ${transactionId} REJECTED`);

    return {
      transaction: {
        id: updated.id,
        status: updated.status,
        updatedAt: updated.updatedAt,
      },
      message: 'Transaction rejected.',
    };
  }

  /** List user's transactions with recommendations. */
  async findAllByUser(userId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      include: { recommendation: true },
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map((t) => ({
      id: t.id,
      merchantName: t.merchantName,
      amount: Number(t.amount),
      currency: t.currency,
      status: t.status,
      description: t.description,
      createdAt: t.createdAt,
      recommendation: t.recommendation
        ? {
            recommendedBank: t.recommendation.recommendedBank,
            merchantCategory: t.recommendation.merchantCategory,
            reason: t.recommendation.reason,
            estimatedBenefit: t.recommendation.estimatedBenefit,
            confidence: Number(t.recommendation.confidence),
          }
        : null,
    }));
  }

  /** Get transaction detail. */
  async findById(userId: string, transactionId: string) {
    const transaction = await this.getOwnedTransaction(userId, transactionId);
    const rec = await this.prisma.recommendation.findUnique({
      where: { transactionId },
    });

    return {
      ...transaction,
      amount: Number(transaction.amount),
      recommendation: rec
        ? {
            id: rec.id,
            recommendedBank: rec.recommendedBank,
            recommendedCardId: rec.recommendedCardId,
            merchantCategory: rec.merchantCategory,
            reason: rec.reason,
            estimatedBenefit: rec.estimatedBenefit,
            confidence: Number(rec.confidence),
          }
        : null,
    };
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private async getOwnedTransaction(userId: string, transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });
    if (!transaction) throw new NotFoundException('Transaction not found');
    if (transaction.userId !== userId) throw new ForbiddenException('Not your transaction');
    return transaction;
  }
}
