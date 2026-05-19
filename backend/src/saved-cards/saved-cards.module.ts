import { Module } from '@nestjs/common';
import { SavedCardsController } from './saved-cards.controller';
import { SavedCardsService } from './saved-cards.service';

@Module({
  controllers: [SavedCardsController],
  providers: [SavedCardsService],
  exports: [SavedCardsService],
})
export class SavedCardsModule {}
