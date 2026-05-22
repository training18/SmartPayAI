export declare class GetQuotesDto {
    senderName: string;
    senderAddress: string;
    senderCity: string;
    receiverName: string;
    receiverAddress: string;
    receiverCity: string;
    width: number;
    height: number;
    length: number;
    weight: number;
    merchantPreference?: string;
}
export declare class CreateShipmentDto extends GetQuotesDto {
    selectedProviderCode: string;
}
