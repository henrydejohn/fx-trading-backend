import { EntityManager } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';

export interface IWalletRepository {
  findByUserId(userId: string): Promise<Wallet | null>;
  findByUserIdForUpdate(userId: string, manager: EntityManager): Promise<Wallet | null>;
  save(wallet: Wallet, manager?: EntityManager): Promise<Wallet>;
}

export const WALLET_REPOSITORY = Symbol('IWalletRepository');
