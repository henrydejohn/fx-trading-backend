import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IWalletRepository,
  WALLET_REPOSITORY,
} from '@domain/repositories/wallet.repository.interface';
import {
  ITransactionRepository,
  TRANSACTION_REPOSITORY,
} from '@domain/repositories/transaction.repository.interface';

@Injectable()
export class GetMyTransactionsUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(userId: string) {
    const transactions = await this.transactionRepository.findByUserId(userId);

    if (!transactions) {
      throw new NotFoundException('Transaction record not found for this account');
    }

    return {
      transactions: transactions.map((t) => ({
        amount: t.amount,
        currency: t.currency,
        direction: t.direction,
        reference: t.reference,
        date: t.createdAt,
      })),
    };
  }
}
