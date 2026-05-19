import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { InitiateTransactionDto } from './dto';
import { CurrentUser } from '../common/decorators';
import { JwtPayload } from '../common/types';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactions: TransactionsService) {}

  @Post('initiate')
  @ApiOperation({
    summary: 'Initiate a payment — AI analyzes merchant and recommends best card',
  })
  initiate(@CurrentUser() user: JwtPayload, @Body() dto: InitiateTransactionDto) {
    return this.transactions.initiate(user.sub, dto);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a pending transaction' })
  approve(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.transactions.approve(user.sub, id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a pending transaction' })
  reject(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.transactions.reject(user.sub, id);
  }

  @Get()
  @ApiOperation({ summary: 'List all transactions for current user' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.transactions.findAllByUser(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction detail with recommendation' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.transactions.findById(user.sub, id);
  }
}
