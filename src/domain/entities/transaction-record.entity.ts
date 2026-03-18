import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';
import { Currency } from '@domain/enums/currency.enum';
import { TransactionType } from '@domain/enums/transaction-type.enum';
import { TransactionDirection } from '@domain/enums/transaction-direction.enum';
import { TransactionStatus } from '@domain/enums/transaction-status.enum';

@Index(['userId', 'createdAt'])
@Entity('transaction_records')
export class TransactionRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @Index()
  @Column({ type: 'uuid' })
  walletId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Index({ unique: true })
  @Column({ unique: true })
  reference: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'enum', enum: TransactionDirection })
  direction: TransactionDirection;

  @Column({ type: 'enum', enum: Currency })
  currency: Currency;

  @Column({ type: 'decimal', precision: 20, scale: 6 })
  amount: string;

  @Column({ type: 'decimal', precision: 20, scale: 6, nullable: true })
  postBalance: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ nullable: true })
  provider?: string;

  @Column({ nullable: true })
  providerReference?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  failureReason?: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  processedAt?: Date;
}
