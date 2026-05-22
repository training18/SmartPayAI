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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CampaignCacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignCacheService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_1 = require("../prisma");
const cache_manager_1 = require("@nestjs/cache-manager");
let CampaignCacheService = CampaignCacheService_1 = class CampaignCacheService {
    prisma;
    config;
    cacheManager;
    logger = new common_1.Logger(CampaignCacheService_1.name);
    ttlMs;
    constructor(prisma, config, cacheManager) {
        this.prisma = prisma;
        this.config = config;
        this.cacheManager = cacheManager;
        this.ttlMs = (this.config.get('CAMPAIGN_CACHE_TTL_SECONDS', 3600)) * 1000;
    }
    async onModuleInit() {
        this.logger.log(`Campaign cache initialized (TTL: ${this.ttlMs / 1000}s)`);
    }
    async getActiveCampaigns(category, bankNames) {
        const cacheKey = this.buildCacheKey(category, bankNames);
        try {
            const cached = await this.cacheManager.get(cacheKey);
            if (cached && Array.isArray(cached) && cached.length > 0) {
                this.logger.debug(`Campaign cache HIT: ${cacheKey} (${cached.length} campaigns)`);
                return cached;
            }
        }
        catch (error) {
            this.logger.warn(`Cache read failed: ${error instanceof Error ? error.message : String(error)}`);
        }
        this.logger.debug(`Campaign cache MISS: ${cacheKey} — querying DB`);
        const campaigns = await this.queryDb(category, bankNames);
        try {
            await this.cacheManager.set(cacheKey, campaigns, this.ttlMs);
        }
        catch (error) {
            this.logger.warn(`Cache write failed: ${error instanceof Error ? error.message : String(error)}`);
        }
        return campaigns;
    }
    async invalidateAll() {
        try {
            await this.cacheManager.clear();
            this.logger.log('Campaign cache invalidated');
        }
        catch (error) {
            this.logger.warn(`Cache invalidation failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async invalidateByCategory(category) {
        await this.invalidateAll();
    }
    async queryDb(category, bankNames) {
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
    buildCacheKey(category, bankNames) {
        const banks = bankNames?.sort().join(',') ?? 'all';
        return `campaigns:${category}:${banks}`;
    }
};
exports.CampaignCacheService = CampaignCacheService;
exports.CampaignCacheService = CampaignCacheService = CampaignCacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        config_1.ConfigService, Object])
], CampaignCacheService);
//# sourceMappingURL=campaign-cache.service.js.map