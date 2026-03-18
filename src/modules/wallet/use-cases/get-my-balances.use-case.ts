import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IWalletRepository,
  WALLET_REPOSITORY,
} from '@domain/repositories/wallet.repository.interface';

@Injectable()
export class GetMyBalancesUseCase {
  constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
  ) {}

  async execute(userId: string) {
    const wallet = await this.walletRepository.findByUserId(userId);

    if (!wallet) {
      throw new NotFoundException('Wallet record not found');
    }

    return {
      balances: wallet.balances.map((b) => ({
        currency: b.currency,
        amount: b.amount,
      })),
    };
  }
}
