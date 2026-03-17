import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { UserSession } from '@domain/entities/user-session.entity';
import {
  IUserSessionRepository,
  CreateSessionData,
} from '@domain/repositories/user-session.repository.interface';

@Injectable()
export class UserSessionRepository implements IUserSessionRepository {
  constructor(
    @InjectRepository(UserSession)
    private readonly repo: Repository<UserSession>,
  ) {}

  async create(data: CreateSessionData, manager?: EntityManager): Promise<UserSession> {
    const repo = manager ? manager.getRepository(UserSession) : this.repo;
    const session = repo.create({
      userId: data.userId,
      hashedRefreshToken: data.hashedRefreshToken,
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
      isActive: true,
      lastUsedAt: new Date(),
      expiresAt: data.expiresAt,
    });
    return repo.save(session);
  }

  async findByTokenHash(hashedRefreshToken: string): Promise<UserSession | null> {
    return this.repo.findOne({
      where: { hashedRefreshToken, isActive: true },
    });
  }

  async findActiveByUserId(userId: string): Promise<UserSession[]> {
    return this.repo.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async updateLastUsedAt(id: string): Promise<void> {
    await this.repo.update(id, { lastUsedAt: new Date() });
  }

  async invalidate(id: string): Promise<void> {
    await this.repo.update(id, { isActive: false });
  }

  async invalidateAllForUser(userId: string): Promise<void> {
    await this.repo.update({ userId, isActive: true }, { isActive: false });
  }

  async deleteExpiredSessions(): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }
}
