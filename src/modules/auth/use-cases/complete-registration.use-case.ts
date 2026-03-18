import { Injectable, Inject, UnauthorizedException, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { USER_REPOSITORY, IUserRepository } from '@domain/repositories/user.repository.interface';
import { UserStatus } from '@domain/enums/user-status.enum';
import { RedisService } from '@infrastructure/cache/redis.service';
import { Wallet } from '@domain/entities/wallet.entity';
import { WalletBalance } from '@domain/entities/wallet-balance.entity';
import * as bcrypt from 'bcrypt';
import { Currency } from '@domain/enums/currency.enum';
import { AuthService } from '@modules/auth/auth.service';
import { CompleteRegistrationDto } from '@modules/auth/dto/complete-registration.dto';
import { ActivityService } from '@infrastructure/activity/activity.service';

@Injectable()
export class CompleteRegistrationUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    private readonly redisService: RedisService,
    private readonly dataSource: DataSource,
    private readonly authService: AuthService,
    private readonly activityService: ActivityService,
  ) {}

  async execute(dto: CompleteRegistrationDto) {
    const { email, registrationToken, password } = dto;

    const storedToken = await this.redisService.get(`reg_token:${email}`);

    if (!storedToken || storedToken !== registrationToken) {
      throw new UnauthorizedException('Registration session expired');
    }

    await this.redisService.del(`reg_token:${email}`);
    const user = await this.dataSource.transaction(async (manager) => {
      const user = await this.userRepo.findByEmail(email);

      if (!user) throw new UnauthorizedException('User record lost');
      if (user.status === UserStatus.VERIFIED) throw new ConflictException('User already verified');

      user.hashedPassword = await bcrypt.hash(password, 12);
      user.status = UserStatus.VERIFIED;
      const updatedUser = await manager.save(user);

      const wallet = await manager.save(Wallet, { userId: updatedUser.id });

      await manager.save(WalletBalance, {
        walletId: wallet.id,
        currency: Currency.NGN,
        amount: '0.000000',
        version: 0,
      });

      return updatedUser;
    });

    // Log Successful Registration
    this.activityService.log(email, 'auth.registration_completed', {
      userId: user.id,
      walletCreated: true,
      currency: 'NGN',
    });

    return this.authService.getAuthResponse(user);
  }
}
