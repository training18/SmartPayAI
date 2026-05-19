import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  MaxLength,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CardType, RewardType } from '@prisma/client';

export class CreateSavedCardDto {
  @ApiProperty({ example: 'Garanti BBVA' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  bankName: string;

  @ApiProperty({ enum: CardType, example: 'CREDIT' })
  @IsEnum(CardType)
  cardType: CardType;

  @ApiProperty({ example: '4567' })
  @IsString()
  @Length(4, 4)
  last4: string;

  @ApiPropertyOptional({ example: 'Bonus Gold' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  cardAlias?: string;

  @ApiPropertyOptional({ example: 'ALEXANDER W.' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  holderName?: string;

  @ApiPropertyOptional({ example: 25000 })
  @IsOptional()
  @IsNumber()
  monthlyLimit?: number;

  @ApiPropertyOptional({ enum: RewardType, example: 'CASHBACK' })
  @IsOptional()
  @IsEnum(RewardType)
  rewardType?: RewardType;
}
