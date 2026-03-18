import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  IUserSessionRepository,
  USER_SESSION_REPOSITORY,
} from '@domain/repositories/user-session.repository.interface';
import { RedisService } from '@infrastructure/cache/redis.service';
import { generateToken, hashRefreshToken, verifyRefreshToken } from '@common/utils/security.util';
import { ActivityService } from '@infrastructure/activity/activity.service';

@Injectable()
export class RefreshSessionUseCase {
  constructor(
    @Inject(USER_SESSION_REPOSITORY)
    private readonly sessionRepository: IUserSessionRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly activityService: ActivityService,
  ) {}

  async execute(refreshToken: string, sessionId: string) {
    const session = await this.sessionRepository.findBySessionId(sessionId);

    if (!session || !session.isActive) {
      throw new UnauthorizedException('Session is no longer active');
    }

    const isSessionActive = await this.redisService.get(`session:${session.id}`);

    if (!isSessionActive) {
      await this.sessionRepository.invalidate(session.id);
      throw new UnauthorizedException('Session expired due to inactivity');
    }

    const secret = this.configService.get<string>('security.tokenHashSecret')!;
    const isValid = verifyRefreshToken(refreshToken, session.hashedRefreshToken, secret);

    if (!isValid) {
      await this.sessionRepository.invalidate(sessionId);
      await this.redisService.del(`session:${sessionId}`);
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (new Date() > session.expiresAt) {
      await this.sessionRepository.invalidate(sessionId);
      throw new UnauthorizedException('Session has reached maximum life');
    }

    const idleSeconds = this.configService.get<number>('session.inactivitySeconds') || 600;
    await this.redisService.set(`session:${sessionId}`, 'active', idleSeconds);

    const accessToken = await this.jwtService.signAsync(
      {
        sub: session.userId,
        sessionId: session.id,
      },
      {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiresIn') as any,
      },
    );

    const newRawRefreshToken = generateToken();
    const newHashedToken = hashRefreshToken(newRawRefreshToken, secret);

    const refreshTtl = this.configService.get<string>('jwt.refreshExpiredIn') || '7';
    const ttlMillis = parseInt(refreshTtl) * 24 * 60 * 60 * 1000;

    await this.sessionRepository.rotate(
      session.id,
      newHashedToken,
      new Date(Date.now() + ttlMillis),
    );

    this.activityService.log(session.userId, 'auth.session_refreshed', {
      metadata: {
        sessionId: session.id,
        ip: session.ipAddress,
      },
    });

    return { accessToken, refreshToken: newRawRefreshToken, sessionId };
  }
}
