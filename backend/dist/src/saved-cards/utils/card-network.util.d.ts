export type CardNetwork = 'VISA' | 'MASTERCARD' | 'AMEX' | 'TROY' | 'DISCOVER' | 'JCB' | 'DINERS' | 'UNIONPAY' | 'UNKNOWN';
export interface CardNetworkInfo {
    network: CardNetwork;
    label: string;
}
export declare function detectCardNetwork(first4: string | null | undefined): CardNetworkInfo;
