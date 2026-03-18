import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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

  async execute(userId: string, limit: number = 10, cursor?: string) {
    const transactions = await this.transactionRepository.findByUserId(userId, limit, cursor);

    if (!transactions) {
      return {
        data: [],
        pageInfo: {
          nextCursor: null,
          hasNextPage: false,
        },
      };
    }

    const hasNextPage = transactions.length > limit;
    const edges = hasNextPage ? transactions.slice(0, limit) : transactions;
    const nextCursor = hasNextPage ? edges[edges.length - 1].id : null;

    return {
      data: edges.map((t) => ({
        id: t.id,
        amount: t.amount,
        currency: t.currency,
        direction: t.direction,
        reference: t.reference,
        date: t.createdAt,
      })),
      pageInfo: {
        nextCursor,
        hasNextPage,
      },
    };
  }
}
