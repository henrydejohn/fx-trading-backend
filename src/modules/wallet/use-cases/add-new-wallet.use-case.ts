import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  WALLET_REPOSITORY,
  IWalletRepository,
} from '@domain/repositories/wallet.repository.interface';
import { Currency } from '@domain/enums/currency.enum';
import { ActivityService } from '@infrastructure/activity/activity.service';
import { WalletBalance } from '@domain/entities/wallet-balance.entity';

@Injectable()
export class AddWalletUseCase {
  constructor(
    @Inject(WALLET_REPOSITORY) private readonly walletRepo: IWalletRepository,
    private readonly dataSource: DataSource,
    private readonly activityService: ActivityService,
  ) {}

  async execute(userId: string, currency: Currency) {
    try {
      await this.dataSource.transaction(async (manager) => {
        const wallet = await this.walletRepo.findByUserIdForUpdate(userId, manager);
        if (!wallet) throw new NotFoundException('Wallet not found');

        const balance = wallet.balances.find((b) => b.currency === currency);

        if (balance) throw new NotFoundException(`${currency} balance already exists`);

        await manager.save(WalletBalance, {
          walletId: wallet.id,
          currency,
          amount: '0.000000',
          version: 0,
        });
      });

      // Log Activity
      this.activityService.log(userId, `add.wallet_success`, {
        currency,
      });

      return { message: 'Add Wallet successful', currency };
    } catch (error) {
      // Log Activity
      this.activityService.log(userId, `add.wallet_failed`, {
        currency,
        error: `${currency} balance already exists`,
      });
      throw error;
    }
  }
}
