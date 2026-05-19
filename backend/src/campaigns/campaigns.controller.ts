import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto';

@ApiTags('Campaigns')
@ApiBearerAuth()
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaigns: CampaignsService) {}

  @Get()
  @ApiOperation({ summary: 'List active campaigns (filterable)' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'bankName', required: false })
  @ApiQuery({ name: 'cardType', required: false })
  findAll(
    @Query('category') category?: string,
    @Query('bankName') bankName?: string,
    @Query('cardType') cardType?: string,
  ) {
    return this.campaigns.findAll({ category, bankName, cardType });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new campaign' })
  create(@Body() dto: CreateCampaignDto) {
    return this.campaigns.create(dto);
  }
}
