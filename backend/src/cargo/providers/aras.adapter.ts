import { Injectable, Logger } from '@nestjs/common';
import { CargoProviderAdapter, CargoQuoteInput, RawCargoQuote } from './cargo-provider.interface';

@Injectable()
export class ArasCargoAdapter implements CargoProviderAdapter {
  private readonly logger = new Logger(ArasCargoAdapter.name);

  // Aras rates (simulating actual API constants)
  private readonly baseRate = 38.0;
  private readonly perKgRate = 4.5;
  private readonly perDesiRate = 4.0;

  async calculateQuote(input: CargoQuoteInput): Promise<RawCargoQuote> {
    this.logger.log(`Calculating Aras quote for shipment to ${input.receiverCity}`);
    
    const billableWeight = Math.max(input.weight, input.desi);
    const price = this.baseRate + billableWeight * Math.max(this.perKgRate, this.perDesiRate);
    
    // Aras delivery time: 1-2 days
    const estimatedDeliveryDays = input.receiverCity.toLowerCase() === input.senderCity.toLowerCase() ? 1 : 2;

    return {
      providerCode: 'aras',
      providerName: 'Aras Kargo',
      price: Math.round(price * 100) / 100,
      estimatedDeliveryDays,
    };
  }
}
