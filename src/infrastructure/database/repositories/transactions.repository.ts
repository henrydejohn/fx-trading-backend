import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITransactionRepository } from '@domain/repositories/transaction.repository.interface';
import { TransactionRecord } from '@domain/entities/transaction-record.entity';

@Injectable()
export class TransactionRepository implements ITransactionRepository {
  constructor(
    @InjectRepository(TransactionRecord)
    private readonly repository: Repository<TransactionRecord>,
  ) {}

  async findByUserId(
    userId: string,
    limit: number = 10,
    cursor?: string,
  ): Promise<TransactionRecord[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId })
      .orderBy('transaction.createdAt', 'DESC')
      .addOrderBy('transaction.id', 'DESC')
      .take(limit + 1);

    if (cursor) {
      queryBuilder.andWhere('transaction.id < :cursor', { cursor });
    }

    return await queryBuilder.getMany();
  }
}
