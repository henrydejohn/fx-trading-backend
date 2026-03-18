import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@domain/entities/user.entity';
import { generateToken, hashRefreshToken } from '@common/utils/security.util';
import { ActivityService } from '@infrastructure/activity/activity.service';
import { IUserRepository, USER_REPOSITORY } from '@domain/repositories/user.repository.interface';
import { RedisService } from '@infrastructure/cache/redis.service';
import {
  IUserSessionRepository,
  USER_SESSION_REPOSITORY,
} from '@domain/repositories/user-session.repository.interface';
import dayjs from 'dayjs';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly activityService: ActivityService,
    private readonly redisService: RedisService,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(USER_SESSION_REPOSITORY) private readonly sessionRepository: IUserSessionRepository,
  ) {}

  async generateAccessToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      status: user.status,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET')!,
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') as any,
    });
  }

  createRegistrationToken(): string {
    return generateToken();
  }

  async getAuthResponse(user: User, clientInfo?: { ip: string; agent: string }) {
    const rawRefreshToken = generateToken();
    const tokenHashSecret = this.configService.get<string>('security.tokenHashSecret')!;
    const hashedRefreshToken = hashRefreshToken(rawRefreshToken, tokenHashSecret);

    const refreshExpiresInDays = parseInt(
      this.configService.get<string>('jwt.refreshExpiresIn') || '7',
      10,
    );
    const idleTimeout = this.configService.get<number>('session.inactivitySeconds') || 600;

    const session = await this.sessionRepository.create({
      userId: user.id,
      hashedRefreshToken,
      userAgent: clientInfo?.agent || null,
      ipAddress: clientInfo?.ip || null,
      expiresAt: dayjs().add(refreshExpiresInDays, 'days').toDate(),
    });

    await this.redisService.set(`session:${session.id}`, 'active', idleTimeout);

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        status: user.status,
        sessionId: session.id,
      },
      {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiresIn') as any,
      },
    );

    this.activityService.log(user.id, 'auth.login_success', { sessionId: session.id, clientInfo });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      sessionId: session.id,
    };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
