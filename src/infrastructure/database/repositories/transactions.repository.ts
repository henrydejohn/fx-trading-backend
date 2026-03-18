import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ITransactionRepository } from '@domain/repositories/transaction.repository.interface';
import { TransactionRecord } from '@domain/entities/transaction-record.entity';

@Injectable()
export class TransactionRepository implements ITransactionRepository {
  constructor(
    @InjectRepository(TransactionRecord)
    private readonly repository: Repository<TransactionRecord>,
  ) {}

  async findByUserId(userId: string): Promise<TransactionRecord[] | null> {
    return await this.repository.find({
      where: { userId },
    });
  }
}
