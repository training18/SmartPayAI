"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const core_1 = require("@nestjs/core");
const cache_manager_1 = require("@nestjs/cache-manager");
const cache_manager_redis_yet_1 = require("cache-manager-redis-yet");
const prisma_1 = require("./prisma");
const guards_1 = require("./common/guards");
const filters_1 = require("./common/filters");
const interceptors_1 = require("./common/interceptors");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const virtual_cards_module_1 = require("./virtual-cards/virtual-cards.module");
const saved_cards_module_1 = require("./saved-cards/saved-cards.module");
const campaigns_module_1 = require("./campaigns/campaigns.module");
const merchants_module_1 = require("./merchants/merchants.module");
const ai_module_1 = require("./ai/ai.module");
const transactions_module_1 = require("./transactions/transactions.module");
const savings_module_1 = require("./savings/savings.module");
const campaign_service_module_1 = require("./campaign-service/campaign-service.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => {
                    const isTest = configService.get('NODE_ENV') === 'test' || process.env.NODE_ENV === 'test';
                    if (isTest) {
                        const logger = new common_1.Logger('CacheModule');
                        logger.log('Running in test environment. Using in-memory cache.');
                        return {};
                    }
                    try {
                        const store = await (0, cache_manager_redis_yet_1.redisStore)({
                            socket: {
                                host: configService.get('REDIS_HOST', 'localhost'),
                                port: configService.get('REDIS_PORT', 6379),
                            },
                        });
                        return { store };
                    }
                    catch (error) {
                        const logger = new common_1.Logger('CacheModule');
                        logger.warn(`Failed to connect to Redis (${configService.get('REDIS_HOST', 'localhost')}:${configService.get('REDIS_PORT', 6379)}). ` +
                            `Falling back to in-memory cache. Error: ${error instanceof Error ? error.message : String(error)}`);
                        return {};
                    }
                },
            }),
            schedule_1.ScheduleModule.forRoot(),
            prisma_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            virtual_cards_module_1.VirtualCardsModule,
            saved_cards_module_1.SavedCardsModule,
            campaigns_module_1.CampaignsModule,
            merchants_module_1.MerchantsModule,
            ai_module_1.AiModule,
            transactions_module_1.TransactionsModule,
            savings_module_1.SavingsModule,
            campaign_service_module_1.CampaignServiceModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: guards_1.JwtAuthGuard },
            { provide: core_1.APP_FILTER, useClass: filters_1.AllExceptionsFilter },
            { provide: core_1.APP_INTERCEPTOR, useClass: interceptors_1.LoggingInterceptor },
            { provide: core_1.APP_INTERCEPTOR, useClass: interceptors_1.TransformInterceptor },
            { provide: core_1.APP_INTERCEPTOR, useClass: interceptors_1.RequestDeduplicationInterceptor },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map