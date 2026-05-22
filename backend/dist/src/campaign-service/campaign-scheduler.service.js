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
var CampaignSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const campaign_aggregator_service_1 = require("./campaign-aggregator.service");
let CampaignSchedulerService = CampaignSchedulerService_1 = class CampaignSchedulerService {
    aggregator;
    config;
    logger = new common_1.Logger(CampaignSchedulerService_1.name);
    isRefreshing = false;
    constructor(aggregator, config) {
        this.aggregator = aggregator;
        this.config = config;
    }
    async onModuleInit() {
        const isDev = this.config.get('NODE_ENV') === 'development';
        const skipStartup = this.config.get('SKIP_STARTUP_CAMPAIGN_REFRESH') === 'true';
        if (isDev || skipStartup) {
            this.logger.log(`Campaign scheduler initialized — startup campaign refresh is SKIPPED (isDev: ${isDev}, skipStartup: ${skipStartup})`);
            return;
        }
        this.logger.log('Campaign scheduler initialized — scheduling initial refresh...');
        setTimeout(() => {
            this.refreshCampaigns().catch((err) => {
                this.logger.error(`Initial campaign refresh failed: ${err.message}`);
            });
        }, 5000);
    }
    async refreshCampaigns() {
        if (this.isRefreshing) {
            this.logger.warn('Campaign refresh already in progress — skipping');
            return;
        }
        this.isRefreshing = true;
        try {
            this.logger.log('Scheduled campaign refresh starting...');
            const summary = await this.aggregator.refreshAll();
            this.logger.log(`[Scheduler] Campaign refresh complete: ` +
                `fetched=${summary.fetchedCount}, upserted=${summary.upsertedCount}, ` +
                `expired=${summary.expiredCount}, duration=${summary.durationMs}ms`);
        }
        catch (error) {
            this.logger.error(`Scheduled campaign refresh failed: ${error instanceof Error ? error.message : String(error)}`);
        }
        finally {
            this.isRefreshing = false;
        }
    }
};
exports.CampaignSchedulerService = CampaignSchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_6_HOURS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CampaignSchedulerService.prototype, "refreshCampaigns", null);
exports.CampaignSchedulerService = CampaignSchedulerService = CampaignSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [campaign_aggregator_service_1.CampaignAggregatorService,
        config_1.ConfigService])
], CampaignSchedulerService);
//# sourceMappingURL=campaign-scheduler.service.js.map