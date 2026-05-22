import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CampaignAggregatorService } from './campaign-aggregator.service';
export declare class CampaignSchedulerService implements OnModuleInit {
    private readonly aggregator;
    private readonly config;
    private readonly logger;
    private isRefreshing;
    constructor(aggregator: CampaignAggregatorService, config: ConfigService);
    onModuleInit(): Promise<void>;
    refreshCampaigns(): Promise<void>;
}
