import { BankConnector, RawBankCampaign } from './bank-connector.interface';
export declare class YkbConnector implements BankConnector {
    private readonly logger;
    readonly bankCode = "ykb";
    readonly bankName = "Yap\u0131 Kredi";
    private readonly CAMPAIGN_URL;
    fetch(): Promise<RawBankCampaign[]>;
    private parseHtml;
}
