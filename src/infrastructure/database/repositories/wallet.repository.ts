import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Wallet } from '@domain/entities/wallet.entity';
import { IWalletRepository } from '@domain/repositories/wallet.repository.interface';

@Injectable()
export class WalletRepository implements IWalletRepository {
  constructor(
    @InjectRepository(Wallet)
    private readonly repository: Repository<Wallet>,
  ) {}

  async findByUserId(userId: string): Promise<Wallet | null> {
    return await this.repository.findOne({
      where: { userId },
      relations: ['balances'],
    });
  }

  async findByUserIdForUpdate(userId: string, manager: EntityManager): Promise<Wallet | null> {
    return await manager
      .createQueryBuilder(Wallet, 'wallet')
      .setLock('pessimistic_write')
      .innerJoinAndSelect('wallet.balances', 'balances')
      .where('wallet.userId = :userId', { userId })
      .getOne();
  }

  async save(wallet: Wallet, manager?: EntityManager): Promise<Wallet> {
    const repo = manager ? manager.getRepository(Wallet) : this.repository;
    return await repo.save(wallet);
  }
}
