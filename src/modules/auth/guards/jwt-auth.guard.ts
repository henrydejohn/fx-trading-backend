import { ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@infrastructure/cache/redis.service';
import {
  IUserSessionRepository,
  USER_SESSION_REPOSITORY,
} from '@domain/repositories/user-session.repository.interface';
import { ActivityService } from '@infrastructure/activity/activity.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    @Inject(USER_SESSION_REPOSITORY)
    private readonly sessionRepository: IUserSessionRepository,
    private readonly activityService: ActivityService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isValidJwt = await super.canActivate(context);
    if (!isValidJwt) return false;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sessionId) {
      throw new UnauthorizedException('Invalid session payload');
    }

    const sessionKey = `session:${user.sessionId}`;
    const isActive = await this.redisService.get(sessionKey);

    if (!isActive) {
      await this.sessionRepository.invalidate(user.sessionId);

      // Log the automatic timeout
      this.activityService.log(user.id, 'auth.session_timeout', {
        metadata: { sessionId: user.sessionId, reason: 'inactivity_10m' },
      });

      throw new UnauthorizedException('Session expired due to inactivity');
    }

    const idleSeconds = this.configService.get<number>('session.inactivitySeconds') || 600;
    await this.redisService.expire(sessionKey, idleSeconds);

    // Update Postgres 'lastUsedAt' (Background/Non-blocking)
    this.sessionRepository.updateLastUsedAt(user.sessionId).catch(() => {});

    return true;
  }
}
