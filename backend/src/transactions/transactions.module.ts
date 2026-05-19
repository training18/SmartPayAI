import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { AiModule } from '../ai/ai.module';
import { VirtualCardsModule } from '../virtual-cards/virtual-cards.module';

@Module({
  imports: [AiModule, VirtualCardsModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
