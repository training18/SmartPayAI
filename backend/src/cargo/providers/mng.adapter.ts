import { Injectable, Logger } from '@nestjs/common';
import { CargoProviderAdapter, CargoQuoteInput, RawCargoQuote } from './cargo-provider.interface';

@Injectable()
export class MngCargoAdapter implements CargoProviderAdapter {
  private readonly logger = new Logger(MngCargoAdapter.name);

  // MNG rates (simulating actual API constants)
  private readonly baseRate = 32.0;
  private readonly perKgRate = 4.0;
  private readonly perDesiRate = 3.5;

  async calculateQuote(input: CargoQuoteInput): Promise<RawCargoQuote> {
    this.logger.log(`Calculating MNG quote for shipment to ${input.receiverCity}`);
    
    const billableWeight = Math.max(input.weight, input.desi);
    const price = this.baseRate + billableWeight * Math.max(this.perKgRate, this.perDesiRate);
    
    // MNG is slightly slower: 1-2 days for same city, 3 days for other cities
    const estimatedDeliveryDays = input.receiverCity.toLowerCase() === input.senderCity.toLowerCase() ? 1 : 3;

    return {
      providerCode: 'mng',
      providerName: 'MNG Kargo',
      price: Math.round(price * 100) / 100,
      estimatedDeliveryDays,
    };
  }
}
