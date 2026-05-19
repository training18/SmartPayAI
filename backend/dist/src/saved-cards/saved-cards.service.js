"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedCardsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../prisma");
let SavedCardsService = class SavedCardsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllByUser(userId) {
        return this.prisma.savedCard.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(userId, dto) {
        return this.prisma.savedCard.create({
            data: { ...dto, userId },
        });
    }
    async update(userId, cardId, dto) {
        const card = await this.ensureOwnership(userId, cardId);
        return this.prisma.savedCard.update({
            where: { id: card.id },
            data: dto,
        });
    }
    async remove(userId, cardId) {
        const card = await this.ensureOwnership(userId, cardId);
        return this.prisma.savedCard.delete({ where: { id: card.id } });
    }
    async findById(cardId) {
        return this.prisma.savedCard.findUnique({ where: { id: cardId } });
    }
    async ensureOwnership(userId, cardId) {
        const card = await this.prisma.savedCard.findUnique({ where: { id: cardId } });
        if (!card)
            throw new common_1.NotFoundException('Card not found');
        if (card.userId !== userId)
            throw new common_1.ForbiddenException('Not your card');
        return card;
    }
};
exports.SavedCardsService = SavedCardsService;
exports.SavedCardsService = SavedCardsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], SavedCardsService);
//# sourceMappingURL=saved-cards.service.js.map