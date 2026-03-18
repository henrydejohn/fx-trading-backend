import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { GetMyBalancesUseCase } from '@modules/wallet/use-cases/get-my-balances.use-case';
import { FundWalletUseCase } from '@modules/wallet/use-cases/fund-wallet.use-case';
import { Currency } from '@domain/enums/currency.enum';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(
    private readonly getMyBalancesUseCase: GetMyBalancesUseCase,
    private readonly fundWalletUseCase: FundWalletUseCase,
  ) {}

  @Get()
  async getBalances(@CurrentUser('id') userId: string) {
    return await this.getMyBalancesUseCase.execute(userId);
  }

  @Post('fund')
  async fund(
    @CurrentUser('id') userId: string,
    @Body() dto: { amount: number; currency: Currency; reference: string },
  ) {
    return await this.fundWalletUseCase.execute(userId, dto.amount, dto.currency, dto.reference);
  }
}
