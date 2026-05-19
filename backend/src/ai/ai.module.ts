import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { MerchantIntelligenceService } from './merchant-intelligence.service';
import { CardRecommendationService } from './card-recommendation.service';
import { MerchantsModule } from '../merchants/merchants.module';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { SavedCardsModule } from '../saved-cards/saved-cards.module';
import { AiController } from './ai.controller';

@Module({
  imports: [MerchantsModule, CampaignsModule, SavedCardsModule],
  controllers: [AiController],
  providers: [AiService, MerchantIntelligenceService, CardRecommendationService],
  exports: [AiService, MerchantIntelligenceService, CardRecommendationService],
})
export class AiModule {}
