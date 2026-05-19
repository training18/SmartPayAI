import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InitiateTransactionDto {
  @ApiProperty({ example: 'Migros', description: 'Merchant name' })
  @IsString()
  merchantName: string;

  @ApiProperty({ example: 350.50, description: 'Transaction amount' })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ example: '5411', description: 'Merchant Category Code' })
  @IsOptional()
  @IsString()
  mcc?: string;

  @ApiPropertyOptional({ example: 'Weekly grocery shopping', description: 'Transaction description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'TRY', description: 'Currency code' })
  @IsOptional()
  @IsString()
  currency?: string;
}
