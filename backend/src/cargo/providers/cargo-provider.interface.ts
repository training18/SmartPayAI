export interface CargoQuoteInput {
  senderCity: string;
  receiverCity: string;
  width: number;
  height: number;
  length: number;
  desi: number;
  weight: number;
}

export interface RawCargoQuote {
  providerCode: string;
  providerName: string;
  price: number;
  estimatedDeliveryDays: number;
}

export interface CargoProviderAdapter {
  calculateQuote(input: CargoQuoteInput): Promise<RawCargoQuote>;
}
