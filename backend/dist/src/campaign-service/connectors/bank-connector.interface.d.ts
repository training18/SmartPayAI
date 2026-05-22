export interface RawBankCampaign {
    bankName: string;
    rawText: string;
    title?: string;
    url?: string;
    fetchedAt: Date;
}
export interface BankConnector {
    bankCode: string;
    bankName: string;
    fetch(): Promise<RawBankCampaign[]>;
}
