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
var CampaignsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../prisma");
const client_1 = require("@prisma/client");
let CampaignsService = CampaignsService_1 = class CampaignsService {
    prisma;
    logger = new common_1.Logger(CampaignsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = { isActive: true };
        if (filters?.category)
            where.category = filters.category;
        if (filters?.bankName)
            where.bankName = filters.bankName;
        if (filters?.cardType)
            where.cardType = filters.cardType;
        return this.prisma.campaign.findMany({
            where,
            orderBy: { rewardRate: 'desc' },
        });
    }
    async findByCategory(category, bankNames) {
        const where = {
            isActive: true,
            category,
        };
        if (bankNames?.length) {
            where.bankName = { in: bankNames };
        }
        return this.prisma.campaign.findMany({
            where,
            orderBy: { rewardRate: 'desc' },
        });
    }
    async create(dto) {
        return this.prisma.campaign.create({ data: dto });
    }
    async expireOld() {
        const result = await this.prisma.campaign.updateMany({
            where: {
                isActive: true,
                endsAt: { lt: new Date() },
            },
            data: { isActive: false },
        });
        if (result.count > 0) {
            this.logger.log(`Expired ${result.count} campaigns past their end date`);
        }
        return result.count;
    }
    async getStats() {
        const [total, active, scraped, manual, seed] = await Promise.all([
            this.prisma.campaign.count(),
            this.prisma.campaign.count({ where: { isActive: true } }),
            this.prisma.campaign.count({ where: { source: client_1.CampaignSource.SCRAPED } }),
            this.prisma.campaign.count({ where: { source: client_1.CampaignSource.MANUAL } }),
            this.prisma.campaign.count({ where: { source: client_1.CampaignSource.SEED } }),
        ]);
        const byBank = await this.prisma.campaign.groupBy({
            by: ['bankName'],
            where: { isActive: true },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
        });
        const byCategory = await this.prisma.campaign.groupBy({
            by: ['category'],
            where: { isActive: true },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
        });
        return {
            total,
            active,
            sources: { scraped, manual, seed },
            byBank: byBank.map((b) => ({ bankName: b.bankName, count: b._count.id })),
            byCategory: byCategory.map((c) => ({ category: c.category, count: c._count.id })),
        };
    }
};
exports.CampaignsService = CampaignsService;
exports.CampaignsService = CampaignsService = CampaignsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], CampaignsService);
//# sourceMappingURL=campaigns.service.js.map