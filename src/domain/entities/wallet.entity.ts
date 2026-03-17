import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { WalletBalance } from '@domain/entities/wallet-balance.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'uuid', unique: true })
  userId: string;

  @OneToMany(() => WalletBalance, (balance) => balance.wallet, {
    cascade: true,
  })
  balances: WalletBalance[];

  @CreateDateColumn()
  createdAt: Date;
}
