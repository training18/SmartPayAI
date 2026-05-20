import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators';
import { JwtPayload } from '../common/types';
import { SavingsService } from './savings.service';

@ApiTags('Savings')
@ApiBearerAuth()
@Controller('savings')
export class SavingsController {
  constructor(private readonly savingsService: SavingsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get savings analytics dashboard' })
  getDashboard(@CurrentUser() user: JwtPayload) {
    return this.savingsService.getSavingsDashboard(user.sub);
  }

  @Post('seed-mock')
  @ApiOperation({ summary: 'Seed mock savings history for the current user' })
  seedMock(@CurrentUser() user: JwtPayload) {
    return this.savingsService.seedMockData(user.sub);
  }
}
