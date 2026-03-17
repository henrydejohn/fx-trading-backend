import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { USER_REPOSITORY, IUserRepository } from '@domain/repositories/user.repository.interface';
import { UserStatus } from '@domain/enums/user-status.enum';
import { RedisService } from '@infrastructure/cache/redis.service';
import { generateOtp } from '@common/utils/security.util';

@Injectable()
export class InitiateRegistrationUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    private readonly redisService: RedisService,
    @InjectQueue('mailer') private readonly mailerQueue: Queue,
  ) {}

  async execute(email: string): Promise<{ message: string }> {
    const user = await this.userRepo.findByEmail(email);
    if (user && user.status === UserStatus.VERIFIED) {
      throw new ConflictException('Account already exists');
    }

    const otp = generateOtp();

    await this.redisService.set(`otp:${email}`, otp, 600);

    if (!user) {
      await this.userRepo.create({ email, status: UserStatus.PENDING });
    }

    await this.mailerQueue.add(
      'send-otp',
      { email, otp },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );

    return { message: 'Verification code sent to your email' };
  }
}
