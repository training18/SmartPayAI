import { PrismaService } from '../prisma';
import { CampaignParserService } from './campaign-parser.service';
import { CampaignCacheService } from './campaign-cache.service';
import { AkbankConnector, IsbankConnector, GarantiConnector, YkbConnector } from './connectors';
export declare class CampaignAggregatorService {
    private readonly prisma;
    private readonly parser;
    private readonly cache;
    private readonly logger;
    private readonly connectors;
    constructor(prisma: PrismaService, parser: CampaignParserService, cache: CampaignCacheService, akbank: AkbankConnector, isbank: IsbankConnector, garanti: GarantiConnector, ykb: YkbConnector);
    refreshAll(): Promise<RefreshSummary>;
    refreshByBanks(bankCodes: string[]): Promise<RefreshSummary>;
    getAvailableBanks(): Array<{
        bankCode: string;
        bankName: string;
    }>;
    private fetchSafe;
    private upsertCampaign;
    private mapRewardType;
    private generateSourceId;
    private expireOldCampaigns;
}
export interface RefreshSummary {
    fetchedCount: number;
    parsedCount: number;
    upsertedCount: number;
    skippedCount: number;
    expiredCount: number;
    errors: string[];
    durationMs: number;
    refreshedAt: string;
}
