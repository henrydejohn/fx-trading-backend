import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@domain/entities/user.entity';
import { generateToken } from '@common/utils/security.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // src/modules/auth/auth.service.ts

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

  async getAuthResponse(user: User) {
    const accessToken = await this.generateAccessToken(user);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
      },
    };
  }
}
