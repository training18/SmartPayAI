import { OnModuleInit } from '@nestjs/common';
import { CampaignAggregatorService } from './campaign-aggregator.service';
export declare class CampaignSchedulerService implements OnModuleInit {
    private readonly aggregator;
    private readonly logger;
    private isRefreshing;
    constructor(aggregator: CampaignAggregatorService);
    onModuleInit(): Promise<void>;
    refreshCampaigns(): Promise<void>;
}
