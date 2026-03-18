import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Wallet } from './wallet.entity';
import { Currency } from '@domain/enums/currency.enum';

@Entity('wallet_balances')
@Index(['walletId', 'currency'], { unique: true })
export class WalletBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  walletId: string;

  @ManyToOne(() => Wallet, (wallet: Wallet) => wallet.balances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;

  @Column({ type: 'enum', enum: Currency })
  currency: Currency;

  @Column({ type: 'decimal', precision: 20, scale: 6, default: '0' })
  amount: string;

  @Column({ type: 'int', default: 0 })
  version: number;
}
