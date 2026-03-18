import { EntityManager } from 'typeorm';
import { UserSession } from '../entities/user-session.entity';

export interface CreateSessionData {
  userId: string;
  hashedRefreshToken: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: Date;
}

export interface IUserSessionRepository {
  create(data: CreateSessionData, manager?: EntityManager): Promise<UserSession>;

  findBySessionId(sessionId: string): Promise<UserSession | null>;

  findActiveByUserId(userId: string): Promise<UserSession[]>;

  updateLastUsedAt(id: string): Promise<void>;

  rotate(id: string, newHashedToken: string, newExpiresAt: Date): Promise<void>;

  invalidate(id: string): Promise<void>;

  invalidateAllForUser(userId: string): Promise<void>;

  deleteExpiredSessions(): Promise<void>;
}

export const USER_SESSION_REPOSITORY = Symbol('IUserSessionRepository');
