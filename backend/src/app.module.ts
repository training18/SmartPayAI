import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

// ── Infrastructure ───────────────────────────────────────────────────────────
import { PrismaModule } from './prisma';
import { JwtAuthGuard } from './common/guards';
import { AllExceptionsFilter } from './common/filters';
import { LoggingInterceptor, TransformInterceptor } from './common/interceptors';

// ── Feature modules ──────────────────────────────────────────────────────────
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VirtualCardsModule } from './virtual-cards/virtual-cards.module';
import { SavedCardsModule } from './saved-cards/saved-cards.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { MerchantsModule } from './merchants/merchants.module';
import { AiModule } from './ai/ai.module';
import { TransactionsModule } from './transactions/transactions.module';

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
  ],
  providers: [
    // Global JWT auth guard — all routes require auth unless @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },

    // Global exception filter — structured error responses
    { provide: APP_FILTER, useClass: AllExceptionsFilter },

    // Global interceptors — logging + response envelope
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
