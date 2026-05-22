import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

// ── Infrastructure ───────────────────────────────────────────────────────────
import { PrismaModule } from './prisma';
import { JwtAuthGuard } from './common/guards';
import { AllExceptionsFilter } from './common/filters';
import { LoggingInterceptor, TransformInterceptor, RequestDeduplicationInterceptor } from './common/interceptors';

// ── Feature modules ──────────────────────────────────────────────────────────
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VirtualCardsModule } from './virtual-cards/virtual-cards.module';
import { SavedCardsModule } from './saved-cards/saved-cards.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { MerchantsModule } from './merchants/merchants.module';
import { AiModule } from './ai/ai.module';
import { TransactionsModule } from './transactions/transactions.module';
import { SavingsModule } from './savings/savings.module';
import { CampaignServiceModule } from './campaign-service/campaign-service.module';

/**
 * Root application module.
 *
 * Wires all feature modules, global providers (auth guard, exception filter,
 * interceptors), and configuration.
 */
@Module({
  imports: [
    // Global config — reads from .env
    ConfigModule.forRoot({ isGlobal: true }),

    // Global Caching — Redis-backed cache-manager with in-memory fallback
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const isTest = configService.get<string>('NODE_ENV') === 'test' || process.env.NODE_ENV === 'test';
        if (isTest) {
          const logger = new Logger('CacheModule');
          logger.log('Running in test environment. Using in-memory cache.');
          return {};
        }

        try {
          const store = await redisStore({
            socket: {
              host: configService.get<string>('REDIS_HOST', 'localhost'),
              port: configService.get<number>('REDIS_PORT', 6379),
            },
          });
          return { store };
        } catch (error) {
          const logger = new Logger('CacheModule');
          logger.warn(
            `Failed to connect to Redis (${configService.get('REDIS_HOST', 'localhost')}:${configService.get('REDIS_PORT', 6379)}). ` +
            `Falling back to in-memory cache. Error: ${error instanceof Error ? error.message : String(error)}`
          );
          return {};
        }
      },
    }),

    // Scheduling — enables @Cron decorators for campaign refresh
    ScheduleModule.forRoot(),

    // Database
    PrismaModule,

    // Features
    AuthModule,
    UsersModule,
    VirtualCardsModule,
    SavedCardsModule,
    CampaignsModule,
    MerchantsModule,
    AiModule,
    TransactionsModule,
    SavingsModule,
    CampaignServiceModule,
  ],
  providers: [
    // Global JWT auth guard — all routes require auth unless @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },

    // Global exception filter — structured error responses
    { provide: APP_FILTER, useClass: AllExceptionsFilter },

    // Global interceptors — logging + response envelope + deduplication
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: RequestDeduplicationInterceptor },
  ],
})
export class AppModule {}
