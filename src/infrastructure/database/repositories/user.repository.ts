import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { User } from '@domain/entities/user.entity';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { UserStatus } from '@domain/enums/user-status.enum';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}
  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }
  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByIdWithLock(id: string, manager: EntityManager): Promise<User | null> {
    return await manager.findOne(User, {
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
  }

  async create(data: Partial<User>, manager?: EntityManager): Promise<User> {
    const repo = manager ? manager.getRepository(User) : this.repo;
    const user = repo.create(data);
    return repo.save(user);
  }

  async save(user: User, manager?: EntityManager): Promise<User> {
    const repo = manager ? manager.getRepository(User) : this.repo;
    return repo.save(user);
  }

  async updateStatus(id: string, status: UserStatus, manager?: EntityManager): Promise<void> {
    const repo = manager ? manager.getRepository(User) : this.repo;
    await repo.update(id, { status });
  }
}
