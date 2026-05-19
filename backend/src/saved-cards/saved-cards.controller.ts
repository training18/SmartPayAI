import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SavedCardsService } from './saved-cards.service';
import { CreateSavedCardDto, UpdateSavedCardDto } from './dto';
import { CurrentUser } from '../common/decorators';
import { JwtPayload } from '../common/types';

@ApiTags('Saved Cards')
@ApiBearerAuth()
@Controller('saved-cards')
export class SavedCardsController {
  constructor(private readonly savedCards: SavedCardsService) {}

  @Get()
  @ApiOperation({ summary: 'List all saved cards for current user' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.savedCards.findAllByUser(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new saved card' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateSavedCardDto) {
    return this.savedCards.create(user.sub, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a saved card' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateSavedCardDto,
  ) {
    return this.savedCards.update(user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a saved card' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.savedCards.remove(user.sub, id);
  }
}
