import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CargoService } from './cargo.service';
import { GetQuotesDto, CreateShipmentDto } from './dto/cargo.dto';
import { CurrentUser } from '../common/decorators';
import { JwtPayload } from '../common/types';

@ApiTags('Cargo Optimization')
@ApiBearerAuth()
@Controller('cargo')
export class CargoController {
  constructor(private readonly cargoService: CargoService) {}

  @Post('shipments/get-quotes')
  @ApiOperation({
    summary: 'Compare shipping options — queries and normalizes pricing across providers',
  })
  @ApiResponse({ status: 200, description: 'List of quotes with base calculations' })
  getQuotes(@CurrentUser() user: JwtPayload, @Body() dto: GetQuotesDto) {
    return this.cargoService.getQuotesAndOptimize(user.sub, dto);
  }

  @Post('shipments/optimize')
  @ApiOperation({
    summary: 'Orchestrates Rules Engine -> AI Optimization Layer -> Final recommendation',
  })
  @ApiResponse({ status: 200, description: 'Ranked shipping options with AI scoring and recommendations' })
  optimize(@CurrentUser() user: JwtPayload, @Body() dto: GetQuotesDto) {
    return this.cargoService.getQuotesAndOptimize(user.sub, dto);
  }

  @Post('shipments/create')
  @ApiOperation({
    summary: 'Finalize and create a shipment order with a selected provider',
  })
  @ApiResponse({ status: 201, description: 'Created shipment detail with tracking and analytics updated' })
  createShipment(@CurrentUser() user: JwtPayload, @Body() dto: CreateShipmentDto) {
    return this.cargoService.createShipment(user.sub, dto);
  }

  @Get('shipments/history')
  @ApiOperation({
    summary: 'Get shipment order history for the current merchant',
  })
  @ApiResponse({ status: 200, description: 'Array of shipments with quotes and tracking details' })
  getHistory(@CurrentUser() user: JwtPayload) {
    return this.cargoService.getShipmentHistory(user.sub);
  }

  @Get('analytics/shipping-savings')
  @ApiOperation({
    summary: 'Retrieve aggregate cargo analytics and savings metrics',
  })
  @ApiResponse({ status: 200, description: 'Aggregated spent, saved, and delivery time insights' })
  getSavings(@CurrentUser() user: JwtPayload) {
    return this.cargoService.getShippingAnalytics(user.sub);
  }
}
