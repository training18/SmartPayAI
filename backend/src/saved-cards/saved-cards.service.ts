import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateSavedCardDto, UpdateSavedCardDto } from './dto';

@Injectable()
export class SavedCardsService {
  constructor(private readonly prisma: PrismaService) {}

  /** List all saved cards for a user. */
  async findAllByUser(userId: string) {
    return this.prisma.savedCard.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Add a new saved card. */
  async create(userId: string, dto: CreateSavedCardDto) {
    return this.prisma.savedCard.create({
      data: { ...dto, userId },
    });
  }

  /** Update a saved card (owned by user). */
  async update(userId: string, cardId: string, dto: UpdateSavedCardDto) {
    const card = await this.ensureOwnership(userId, cardId);
    return this.prisma.savedCard.update({
      where: { id: card.id },
      data: dto,
    });
  }

  /** Delete a saved card (owned by user). */
  async remove(userId: string, cardId: string) {
    const card = await this.ensureOwnership(userId, cardId);
    return this.prisma.savedCard.delete({ where: { id: card.id } });
  }

  /** Find a specific card by ID. */
  async findById(cardId: string) {
    return this.prisma.savedCard.findUnique({ where: { id: cardId } });
  }

  // ── Ownership check ─────────────────────────────────────────────────────

  private async ensureOwnership(userId: string, cardId: string) {
    const card = await this.prisma.savedCard.findUnique({ where: { id: cardId } });
    if (!card) throw new NotFoundException('Card not found');
    if (card.userId !== userId) throw new ForbiddenException('Not your card');
    return card;
  }
}
