import { BankConnector, RawBankCampaign } from './bank-connector.interface';
export declare class GarantiConnector implements BankConnector {
    private readonly logger;
    readonly bankCode = "garanti";
    readonly bankName = "Garanti BBVA";
    private readonly CAMPAIGN_URL;
    fetch(): Promise<RawBankCampaign[]>;
    private parseHtml;
}
