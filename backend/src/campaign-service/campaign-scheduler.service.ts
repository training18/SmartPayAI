import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CampaignAggregatorService } from './campaign-aggregator.service';

/**
 * Campaign refresh scheduler.
 *
 * Runs periodic campaign refresh jobs:
 * - On application startup: initial campaign load
 * - Every 6 hours: full refresh from all bank connectors
 * - Daily at midnight: expiration sweep
 *
 * The scheduler ensures campaigns stay fresh without manual intervention.
 */
@Injectable()
export class CampaignSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(CampaignSchedulerService.name);
  private isRefreshing = false;

  constructor(
    private readonly aggregator: CampaignAggregatorService,
    private readonly config: ConfigService,
  ) {}

  /**
   * On startup, trigger an initial campaign refresh.
   * Uses a short delay to let the app fully initialize first.
   */
  async onModuleInit() {
    const isDev = this.config.get<string>('NODE_ENV') === 'development';
    const skipStartup = this.config.get<string>('SKIP_STARTUP_CAMPAIGN_REFRESH') === 'true';

    if (isDev || skipStartup) {
      this.logger.log(
        `Campaign scheduler initialized — startup campaign refresh is SKIPPED (isDev: ${isDev}, skipStartup: ${skipStartup})`
      );
      return;
    }

    this.logger.log('Campaign scheduler initialized — scheduling initial refresh...');

    // Delay initial refresh by 5 seconds to let app boot complete
    setTimeout(() => {
      this.refreshCampaigns().catch((err) => {
        this.logger.error(`Initial campaign refresh failed: ${err.message}`);
      });
    }, 5000);
  }

  /**
   * Full campaign refresh — runs every 6 hours.
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async refreshCampaigns(): Promise<void> {
    if (this.isRefreshing) {
      this.logger.warn('Campaign refresh already in progress — skipping');
      return;
    }

    this.isRefreshing = true;

    try {
      this.logger.log('Scheduled campaign refresh starting...');
      const summary = await this.aggregator.refreshAll();

      this.logger.log(
        `[Scheduler] Campaign refresh complete: ` +
        `fetched=${summary.fetchedCount}, upserted=${summary.upsertedCount}, ` +
        `expired=${summary.expiredCount}, duration=${summary.durationMs}ms`,
      );
    } catch (error) {
      this.logger.error(
        `Scheduled campaign refresh failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      this.isRefreshing = false;
    }
  }
}
