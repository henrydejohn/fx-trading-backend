import { Inject, Injectable } from '@nestjs/common';
import {
  IUserSessionRepository,
  USER_SESSION_REPOSITORY,
} from '@domain/repositories/user-session.repository.interface';
import { RedisService } from '@infrastructure/cache/redis.service';
import { ActivityService } from '@infrastructure/activity/activity.service';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(USER_SESSION_REPOSITORY)
    private readonly sessionRepository: IUserSessionRepository,
    private readonly redisService: RedisService,
    private readonly activityService: ActivityService,
  ) {}

  async execute(userId: string, sessionId: string): Promise<void> {
    await this.redisService.del(`session:${sessionId}`);
    await this.sessionRepository.invalidate(sessionId);

    this.activityService.log(userId, 'auth.logout_success', {
      sessionId,
      timestamp: new Date().toISOString(),
      reason: 'user_initiated',
    });
  }
}
