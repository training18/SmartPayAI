import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { v4 as uuid } from 'uuid';

/**
 * Virtual card service — generates and manages demo virtual cards.
 *
 * Each user gets one virtual card on registration with a realistic-looking
 * card number (4XXX pattern), random CVV, and 10,000 TL demo balance.
 */
@Injectable()
export class VirtualCardsService {
  private readonly logger = new Logger(VirtualCardsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Create a demo virtual card for a newly registered user. */
  async createForUser(userId: string, holderName: string) {
    const cardNumber = this.generateCardNumber();
    const cvv = this.generateCvv();
    const now = new Date();

    const card = await this.prisma.virtualCard.create({
      data: {
        userId,
        cardNumber,
        expiryMonth: now.getMonth() + 1, // current month
        expiryYear: now.getFullYear() + 3, // +3 years
        cvv,
        cardHolder: holderName.toUpperCase(),
        balance: 10000.0,
        provider: 'SmartPay',
        status: 'ACTIVE',
      },
    });

    this.logger.log(`Virtual card created for user ${userId}: ****${card.cardNumber.slice(-4)}`);
    return card;
  }

  /** Get the user's virtual card. */
  async getByUserId(userId: string) {
    return this.prisma.virtualCard.findUnique({
      where: { userId },
    });
  }

  /** Deduct amount from virtual card balance (demo only). */
  async deductBalance(userId: string, amount: number) {
    const card = await this.prisma.virtualCard.findUniqueOrThrow({
      where: { userId },
    });

    const currentBalance = Number(card.balance);
    if (currentBalance < amount) {
      throw new Error('Insufficient virtual card balance');
    }

    return this.prisma.virtualCard.update({
      where: { userId },
      data: { balance: currentBalance - amount },
    });
  }

  // ── Card number generation ──────────────────────────────────────────────

  /**
   * Generates a realistic 16-digit card number starting with 4 (Visa-like).
   * Passes Luhn checksum for demo realism.
   */
  private generateCardNumber(): string {
    // Start with 4 (Visa-like) + SmartPay BIN prefix
    const prefix = '4903';
    let number = prefix;

    // Generate 11 random digits
    for (let i = 0; i < 11; i++) {
      number += Math.floor(Math.random() * 10).toString();
    }

    // Calculate Luhn check digit
    number += this.luhnCheckDigit(number);
    return number;
  }

  private luhnCheckDigit(partial: string): string {
    const digits = partial.split('').map(Number).reverse();
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
      let d = digits[i];
      if (i % 2 === 0) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
    }
    return ((10 - (sum % 10)) % 10).toString();
  }

  private generateCvv(): string {
    return Math.floor(100 + Math.random() * 900).toString();
  }
}
