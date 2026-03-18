import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { GetMyTransactionsUseCase } from '@modules/transactions/use-cases/get-my-transactions.use-case';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly getMyTransactions: GetMyTransactionsUseCase) {}

  @Get()
  async getBalances(@CurrentUser('id') userId: string) {
    return await this.getMyTransactions.execute(userId);
  }
}
