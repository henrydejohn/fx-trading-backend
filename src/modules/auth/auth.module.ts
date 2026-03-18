import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '@modules/auth/strategies/jwt.strategy';
import { Module } from '@nestjs/common';
import { AuthController } from '@modules/auth/auth.controller';
import { InitiateRegistrationUseCase } from '@modules/auth/use-cases/initiate-registration.use-case';
import { VerifyRegistrationOtpUseCase } from '@modules/auth/use-cases/verify-registration-otp.use-case';
import { CompleteRegistrationUseCase } from '@modules/auth/use-cases/complete-registration.use-case';
import { AuthService } from '@modules/auth/auth.service';
import { USER_REPOSITORY } from '@domain/repositories/user.repository.interface';
import { UserRepository } from '@infrastructure/database/repositories/user.repository';
import { User } from '@domain/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RefreshSessionUseCase } from '@modules/auth/use-cases/refresh-session.use-case';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { RedisModule } from '@infrastructure/cache/redis.module';
import { ActivityModule } from '@infrastructure/activity/activity.module';
import { LogoutUseCase } from '@modules/auth/use-cases/logout.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    DatabaseModule,
    RedisModule,
    ActivityModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET')!,
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    InitiateRegistrationUseCase,
    VerifyRegistrationOtpUseCase,
    CompleteRegistrationUseCase,
    RefreshSessionUseCase,
    LogoutUseCase,
  ],
  exports: [AuthService],
})
export class AuthModule {}
