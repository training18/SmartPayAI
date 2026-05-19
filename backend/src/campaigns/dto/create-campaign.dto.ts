import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CardType, RewardType } from '@prisma/client';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Migros %5 Cashback' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Earn 5% cashback on all grocery purchases at Migros with Garanti Bonus card.' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'Garanti BBVA' })
  @IsString()
  bankName: string;

  @ApiPropertyOptional({ enum: CardType, example: 'CREDIT' })
  @IsOptional()
  @IsEnum(CardType)
  cardType?: CardType;

  @ApiProperty({ enum: RewardType, example: 'CASHBACK' })
  @IsEnum(RewardType)
  rewardType: RewardType;

  @ApiProperty({ example: 'grocery', description: 'Merchant category this campaign targets' })
  @IsString()
  category: string;

  @ApiProperty({ example: 5.0, description: 'Reward rate as percentage' })
  @IsNumber()
  rewardRate: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  minAmount?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  maxReward?: number;

  @ApiPropertyOptional({ example: 6 })
  @IsOptional()
  @IsNumber()
  installmentCount?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endsAt?: string;
}
