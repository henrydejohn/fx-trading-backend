import { EntityManager } from 'typeorm';
import { User } from '@domain/entities/user.entity';
import { UserStatus } from '@domain/enums/user-status.enum';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByIdWithLock(id: string, manager: EntityManager): Promise<User | null>;
  create(data: Partial<User>, manager?: EntityManager): Promise<User>;
  save(user: User, manager?: EntityManager): Promise<User>;
  updateStatus(id: string, status: UserStatus, manager?: EntityManager): Promise<void>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');
