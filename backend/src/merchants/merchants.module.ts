import { Module } from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { MccMappingService } from './mcc-mapping.service';

@Module({
  providers: [MerchantsService, MccMappingService],
  exports: [MerchantsService, MccMappingService],
})
export class MerchantsModule {}
