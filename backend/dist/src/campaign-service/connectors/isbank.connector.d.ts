import { BankConnector, RawBankCampaign } from './bank-connector.interface';
export declare class IsbankConnector implements BankConnector {
    private readonly logger;
    readonly bankCode = "isbank";
    readonly bankName = "\u0130\u015F Bankas\u0131";
    private readonly CAMPAIGN_URL;
    fetch(): Promise<RawBankCampaign[]>;
    private parseHtml;
}
