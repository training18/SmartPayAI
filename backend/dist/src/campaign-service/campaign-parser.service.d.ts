import { AiService } from '../ai/ai.service';
import type { RawBankCampaign } from './connectors';
export interface ParsedCampaign {
    title: string;
    category: string;
    rewardType: 'CASHBACK' | 'POINTS' | 'MILES' | 'DISCOUNT';
    rewardPercent: number;
    rewardCurrency: string | null;
    network: string | null;
    cardType: 'CREDIT' | 'DEBIT' | null;
    channels: string[];
    minAmount: number | null;
    maxReward: number | null;
    startsAt: string | null;
    endsAt: string | null;
    merchants: string[];
    confidence: number;
}
export declare class CampaignParserService {
    private readonly ai;
    private readonly logger;
    constructor(ai: AiService);
    parse(raw: RawBankCampaign): Promise<ParsedCampaign>;
    parseBatch(raws: RawBankCampaign[]): Promise<ParsedCampaign[]>;
    private sanitize;
    private fallbackParse;
}
