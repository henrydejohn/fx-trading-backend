import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  WALLET_REPOSITORY,
  IWalletRepository,
} from '@domain/repositories/wallet.repository.interface';
import { Currency } from '@domain/enums/currency.enum';
import { ActivityService } from '@infrastructure/activity/activity.service';
import { TransactionRecord } from '@domain/entities/transaction-record.entity';
import { TransactionType } from '@domain/enums/transaction-type.enum';
import { TransactionStatus } from '@domain/enums/transaction-status.enum';
import Decimal from 'decimal.js';

@Injectable()
export class FundWalletUseCase {
  constructor(
    @Inject(WALLET_REPOSITORY) private readonly walletRepo: IWalletRepository,
    @InjectQueue('mailer') private readonly mailerQueue: Queue,
    private readonly dataSource: DataSource,
    private readonly activityService: ActivityService,
  ) {}

  async execute(userId: string, amount: number, currency: Currency, reference: string) {
    try {
      const result = await this.dataSource.transaction(async (manager) => {
        const existing = await manager.findOne(TransactionRecord, { where: { reference } });
        if (existing) {
          return { alreadyProcessed: true, amount: existing.amount };
        }

        const wallet = await this.walletRepo.findByUserIdForUpdate(userId, manager);

        if (!wallet) throw new NotFoundException('Wallet not found');

        const balance = wallet.balances.find((b) => b.currency === currency);

        if (!balance) throw new NotFoundException(`${currency} balance not found`);

        const newBalance = new Decimal(balance.amount).plus(amount);

        balance.amount = newBalance.toString();

        await this.walletRepo.save(wallet, manager);

        await manager.save(TransactionRecord, {
          userId,
          walletId: wallet.id,
          reference,
          type: TransactionType.FUNDING,
          amount: amount.toString(),
          currency,
          status: TransactionStatus.SUCCESS,
          postBalance: newBalance.toString(),
          metadata: { method: 'manual' },
        });

        return { alreadyProcessed: false, amount, currency };
      });

      if (result.alreadyProcessed) {
        return { message: 'Transaction already processed', amount: result.amount };
      }

      await this.dispatchNotifications(
        userId,
        result.amount,
        result.currency!,
        'success',
        reference,
      );

      return { message: 'Funding successful', amount: result.amount };
    } catch (error) {
      await this.dispatchNotifications(
        userId,
        amount,
        currency,
        'failed',
        reference,
        error.message,
      );
      throw error;
    }
  }

  private async dispatchNotifications(
    userId: string,
    amount: string | number,
    currency: Currency,
    status: 'success' | 'failed',
    reference: string,
    reason?: string,
  ) {
    // Queue the Mailer
    await this.mailerQueue.add(
      'send-fund-notification',
      { userId, amount, currency, status, reason },
      { attempts: 3, backoff: { type: 'exponential', delay: 1000 } },
    );

    // Log Activity
    this.activityService.log(userId, `wallet.funding_${status}`, {
      amount,
      currency,
      reference,
      error: reason,
    });
  }
}
