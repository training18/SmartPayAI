import { BankConnector, RawBankCampaign } from './bank-connector.interface';
export declare class AkbankConnector implements BankConnector {
    private readonly logger;
    readonly bankCode = "akbank";
    readonly bankName = "Akbank";
    private readonly CAMPAIGN_URL;
    fetch(): Promise<RawBankCampaign[]>;
    private parseHtml;
    private cleanText;
}
