import { Module, forwardRef } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { CampaignParserService } from './campaign-parser.service';
import { CampaignAggregatorService } from './campaign-aggregator.service';
import { CampaignCacheService } from './campaign-cache.service';
import { CampaignSchedulerService } from './campaign-scheduler.service';
import {
  AkbankConnector,
  IsbankConnector,
  GarantiConnector,
  YkbConnector,
} from './connectors';

/**
 * Campaign Service Module.
 *
 * Provides the real-time campaign intelligence pipeline:
 * - Bank connectors (per-bank campaign fetchers)
 * - AI campaign parser
 * - Campaign aggregator (orchestrator)
 * - Campaign cache (Redis-backed)
 * - Campaign scheduler (cron-based refresh)
 */
@Module({
  imports: [forwardRef(() => AiModule)],
  providers: [
    // Bank connectors
    AkbankConnector,
    IsbankConnector,
    GarantiConnector,
    YkbConnector,

    // Core services
    CampaignParserService,
    CampaignAggregatorService,
    CampaignCacheService,
    CampaignSchedulerService,
  ],
  exports: [
    CampaignAggregatorService,
    CampaignCacheService,
  ],
})
export class CampaignServiceModule {}
