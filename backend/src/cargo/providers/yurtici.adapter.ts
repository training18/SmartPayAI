import { Injectable, Logger } from '@nestjs/common';
import { CargoProviderAdapter, CargoQuoteInput, RawCargoQuote } from './cargo-provider.interface';

@Injectable()
export class YurticiCargoAdapter implements CargoProviderAdapter {
  private readonly logger = new Logger(YurticiCargoAdapter.name);

  // Yurtiçi rates (simulating actual API constants)
  private readonly baseRate = 45.0;
  private readonly perKgRate = 5.0;
  private readonly perDesiRate = 4.5;

  async calculateQuote(input: CargoQuoteInput): Promise<RawCargoQuote> {
    this.logger.log(`Calculating Yurtiçi quote for shipment to ${input.receiverCity}`);
    
    // Yurtiçi uses max of weight and desi
    const billableWeight = Math.max(input.weight, input.desi);
    const price = this.baseRate + billableWeight * Math.max(this.perKgRate, this.perDesiRate);
    
    // Yurtiçi is fast: 1 day for major cities, 2 days max
    const estimatedDeliveryDays = input.receiverCity.toLowerCase() === input.senderCity.toLowerCase() ? 1 : 2;

    return {
      providerCode: 'yurtici',
      providerName: 'Yurtiçi Kargo',
      price: Math.round(price * 100) / 100,
      estimatedDeliveryDays,
    };
  }
}
