import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MerchantIntelligenceService } from './merchant-intelligence.service';
import { CardRecommendationService } from './card-recommendation.service';
import { CurrentUser } from '../common/decorators';
import { JwtPayload } from '../common/types';

class AnalyzeMerchantDto {
  @ApiProperty({ example: 'Migros' })
  @IsString()
  merchantName: string;

  @ApiPropertyOptional({ example: '5411' })
  @IsOptional()
  @IsString()
  mcc?: string;
}

class RecommendCardDto {
  @ApiProperty({ example: 'Migros' })
  @IsString()
  merchantName: string;

  @ApiProperty({ example: 'grocery' })
  @IsString()
  merchantCategory: string;

  @ApiProperty({ example: 350.0 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: 'TRY' })
  @IsOptional()
  @IsString()
  currency?: string;
}

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(
    private readonly merchantIntel: MerchantIntelligenceService,
    private readonly cardRecommendation: CardRecommendationService,
  ) { }

  @Post('analyze-merchant')
  @ApiOperation({ summary: 'AI-powered merchant analysis' })
  analyzeMerchant(@Body() dto: AnalyzeMerchantDto) {
    return this.merchantIntel.analyze(dto.merchantName, dto.mcc);
  }

  @Post('recommend-card')
  @ApiOperation({ summary: 'AI-powered card recommendation' })
  recommendCard(@CurrentUser() user: JwtPayload, @Body() dto: RecommendCardDto) {
    return this.cardRecommendation.recommend(
      user.sub,
      dto.merchantName,
      dto.merchantCategory,
      dto.amount,
      dto.currency,
    );
  }
}
