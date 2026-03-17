import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RedisService } from '@infrastructure/cache/redis.service';
import { compareOtp, generateToken } from '@common/utils/security.util';

@Injectable()
export class VerifyRegistrationOtpUseCase {
  constructor(private readonly redisService: RedisService) {}

  async execute(email: string, otp: string): Promise<{ registrationToken: string }> {
    const storedOtp = await this.redisService.get(`otp:${email}`);

    if (!storedOtp) {
      throw new UnauthorizedException('OTP expired or not found');
    }

    // Constant-time comparison to prevent timing attacks
    const isValid = compareOtp(otp, storedOtp);
    if (!isValid) {
      throw new UnauthorizedException('Invalid verification code');
    }

    // Generate a Proof-of-Verification token (TTL 15 mins)
    const registrationToken = generateToken();
    await this.redisService.set(`reg_token:${email}`, registrationToken, 900);

    // Cleanup OTP immediately so it can't be reused
    await this.redisService.del(`otp:${email}`);

    return { registrationToken };
  }
}
