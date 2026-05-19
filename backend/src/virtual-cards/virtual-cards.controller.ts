import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VirtualCardsService } from './virtual-cards.service';
import { CurrentUser } from '../common/decorators';
import { JwtPayload } from '../common/types';

@ApiTags('Virtual Cards')
@ApiBearerAuth()
@Controller('virtual-cards')
export class VirtualCardsController {
  constructor(private readonly virtualCards: VirtualCardsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user virtual card' })
  getMyCard(@CurrentUser() user: JwtPayload) {
    return this.virtualCards.getByUserId(user.sub);
  }
}
