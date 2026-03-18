import { TransactionRecord } from '@domain/entities/transaction-record.entity';

export interface ITransactionRepository {
  findByUserId(userId: string, limit: number, cursor?: string): Promise<TransactionRecord[] | null>;
}

export const TRANSACTION_REPOSITORY = Symbol('ITransactionRepository');
