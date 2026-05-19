import { Module } from '@nestjs/common';
import { VirtualCardsController } from './virtual-cards.controller';
import { VirtualCardsService } from './virtual-cards.service';

@Module({
  controllers: [VirtualCardsController],
  providers: [VirtualCardsService],
  exports: [VirtualCardsService],
})
export class VirtualCardsModule {}
