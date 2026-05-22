import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetQuotesDto {
  @ApiProperty({ example: 'TechMerchant A.Ş.', description: 'Sender business name' })
  @IsString()
  senderName: string;

  @ApiProperty({ example: 'Levent Mah. Nispetiye Cad. No:12', description: 'Sender address detail' })
  @IsString()
  senderAddress: string;

  @ApiProperty({ example: 'Istanbul', description: 'Sender city' })
  @IsString()
  senderCity: string;

  @ApiProperty({ example: 'Ahmet Yılmaz', description: 'Receiver customer name' })
  @IsString()
  receiverName: string;

  @ApiProperty({ example: 'Kavaklıdere Mah. Atatürk Bulvarı No:142', description: 'Receiver address detail' })
  @IsString()
  receiverAddress: string;

  @ApiProperty({ example: 'Ankara', description: 'Receiver city' })
  @IsString()
  receiverCity: string;

  @ApiProperty({ example: 30, description: 'Package width in cm' })
  @IsNumber()
  @Min(0.1)
  width: number;

  @ApiProperty({ example: 20, description: 'Package height in cm' })
  @IsNumber()
  @Min(0.1)
  height: number;

  @ApiProperty({ example: 40, description: 'Package length in cm' })
  @IsNumber()
  @Min(0.1)
  length: number;

  @ApiProperty({ example: 4.5, description: 'Package weight in kg' })
  @IsNumber()
  @Min(0.01)
  weight: number;

  @ApiPropertyOptional({
    example: 'Deliver as fast as possible. Prefer reliability over cheapest cost.',
    description: 'Custom semantic preference for AI optimization engine',
  })
  @IsOptional()
  @IsString()
  merchantPreference?: string;
}

export class CreateShipmentDto extends GetQuotesDto {
  @ApiProperty({ example: 'yurtici', description: 'Code of the selected cargo provider' })
  @IsString()
  selectedProviderCode: string;
}
