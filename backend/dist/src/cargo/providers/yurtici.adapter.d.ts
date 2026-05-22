import { CargoProviderAdapter, CargoQuoteInput, RawCargoQuote } from './cargo-provider.interface';
export declare class YurticiCargoAdapter implements CargoProviderAdapter {
    private readonly logger;
    private readonly baseRate;
    private readonly perKgRate;
    private readonly perDesiRate;
    calculateQuote(input: CargoQuoteInput): Promise<RawCargoQuote>;
}
