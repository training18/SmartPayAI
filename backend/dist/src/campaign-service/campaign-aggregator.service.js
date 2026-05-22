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
var CampaignAggregatorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignAggregatorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../prisma");
const campaign_parser_service_1 = require("./campaign-parser.service");
const campaign_cache_service_1 = require("./campaign-cache.service");
const connectors_1 = require("./connectors");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
let CampaignAggregatorService = CampaignAggregatorService_1 = class CampaignAggregatorService {
    prisma;
    parser;
    cache;
    logger = new common_1.Logger(CampaignAggregatorService_1.name);
    connectors;
    constructor(prisma, parser, cache, akbank, isbank, garanti, ykb) {
        this.prisma = prisma;
        this.parser = parser;
        this.cache = cache;
        this.connectors = [akbank, isbank, garanti, ykb];
    }
    async refreshAll() {
        const startTime = Date.now();
        this.logger.log('Starting campaign refresh pipeline...');
        const fetchResults = await Promise.allSettled(this.connectors.map((c) => this.fetchSafe(c)));
        const rawCampaigns = [];
        const errors = [];
        for (const result of fetchResults) {
            if (result.status === 'fulfilled') {
                rawCampaigns.push(...result.value);
            }
            else {
                errors.push(String(result.reason));
            }
        }
        this.logger.log(`Fetched ${rawCampaigns.length} raw campaigns from ${this.connectors.length} banks`);
        const parsed = await this.parser.parseBatch(rawCampaigns);
        let upsertedCount = 0;
        let skippedCount = 0;
        for (let i = 0; i < rawCampaigns.length; i++) {
            const raw = rawCampaigns[i];
            const campaign = parsed[i];
            try {
                const sourceId = this.generateSourceId(raw.bankName, campaign.title, campaign.category);
                await this.upsertCampaign(raw, campaign, sourceId);
                upsertedCount++;
            }
            catch (error) {
                const msg = error instanceof Error ? error.message : String(error);
                this.logger.warn(`Failed to upsert campaign "${campaign.title}": ${msg}`);
                skippedCount++;
            }
        }
        const expiredCount = await this.expireOldCampaigns();
        await this.cache.invalidateAll();
        const duration = Date.now() - startTime;
        const summary = {
            fetchedCount: rawCampaigns.length,
            parsedCount: parsed.length,
            upsertedCount,
            skippedCount,
            expiredCount,
            errors,
            durationMs: duration,
            refreshedAt: new Date().toISOString(),
        };
        this.logger.log(`Campaign refresh complete: ${upsertedCount} upserted, ${skippedCount} skipped, ` +
            `${expiredCount} expired, ${duration}ms`);
        return summary;
    }
    async refreshByBanks(bankCodes) {
        const targets = this.connectors.filter((c) => bankCodes.includes(c.bankCode));
        if (targets.length === 0) {
            return {
                fetchedCount: 0,
                parsedCount: 0,
                upsertedCount: 0,
                skippedCount: 0,
                expiredCount: 0,
                errors: [`No connectors found for: ${bankCodes.join(', ')}`],
                durationMs: 0,
                refreshedAt: new Date().toISOString(),
            };
        }
        const startTime = Date.now();
        const rawCampaigns = [];
        for (const connector of targets) {
            const fetched = await this.fetchSafe(connector);
            rawCampaigns.push(...fetched);
        }
        const parsed = await this.parser.parseBatch(rawCampaigns);
        let upsertedCount = 0;
        for (let i = 0; i < rawCampaigns.length; i++) {
            const raw = rawCampaigns[i];
            const campaign = parsed[i];
            try {
                const sourceId = this.generateSourceId(raw.bankName, campaign.title, campaign.category);
                await this.upsertCampaign(raw, campaign, sourceId);
                upsertedCount++;
            }
            catch { }
        }
        await this.cache.invalidateAll();
        return {
            fetchedCount: rawCampaigns.length,
            parsedCount: parsed.length,
            upsertedCount,
            skippedCount: rawCampaigns.length - upsertedCount,
            expiredCount: 0,
            errors: [],
            durationMs: Date.now() - startTime,
            refreshedAt: new Date().toISOString(),
        };
    }
    getAvailableBanks() {
        return this.connectors.map((c) => ({ bankCode: c.bankCode, bankName: c.bankName }));
    }
    async fetchSafe(connector) {
        try {
            return await connector.fetch();
        }
        catch (error) {
            this.logger.error(`Connector ${connector.bankCode} failed: ${error instanceof Error ? error.message : String(error)}`);
            return [];
        }
    }
    async upsertCampaign(raw, parsed, sourceId) {
        const rewardType = this.mapRewardType(parsed.rewardType);
        const cardType = parsed.cardType ? parsed.cardType : null;
        const data = {
            title: parsed.title,
            description: raw.rawText.slice(0, 500),
            bankName: raw.bankName,
            cardType,
            rewardType,
            category: parsed.category,
            rewardRate: parsed.rewardPercent,
            minAmount: parsed.minAmount,
            maxReward: parsed.maxReward,
            isActive: true,
            source: client_1.CampaignSource.SCRAPED,
            sourceId,
            rawText: raw.rawText,
            network: parsed.network,
            channels: parsed.channels,
            rewardCurrency: parsed.rewardCurrency,
            parsedByAi: true,
            fetchedAt: raw.fetchedAt,
            endsAt: parsed.endsAt ? new Date(parsed.endsAt) : null,
        };
        await this.prisma.campaign.upsert({
            where: { sourceId },
            create: data,
            update: {
                ...data,
                updatedAt: new Date(),
            },
        });
    }
    mapRewardType(type) {
        switch (type) {
            case 'CASHBACK': return client_1.RewardType.CASHBACK;
            case 'POINTS': return client_1.RewardType.POINTS;
            case 'MILES': return client_1.RewardType.MILES;
            case 'DISCOUNT': return client_1.RewardType.DISCOUNT;
            default: return client_1.RewardType.NONE;
        }
    }
    generateSourceId(bankName, title, category) {
        const input = `${bankName}::${title}::${category}`.toLowerCase();
        return (0, crypto_1.createHash)('sha256').update(input).digest('hex').slice(0, 16);
    }
    async expireOldCampaigns() {
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
};
exports.CampaignAggregatorService = CampaignAggregatorService;
exports.CampaignAggregatorService = CampaignAggregatorService = CampaignAggregatorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        campaign_parser_service_1.CampaignParserService,
        campaign_cache_service_1.CampaignCacheService,
        connectors_1.AkbankConnector,
        connectors_1.IsbankConnector,
        connectors_1.GarantiConnector,
        connectors_1.YkbConnector])
], CampaignAggregatorService);
//# sourceMappingURL=campaign-aggregator.service.js.map