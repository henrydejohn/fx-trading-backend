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

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
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
    { provide: USER_REPOSITORY, useClass: UserRepository },
    AuthService,
    JwtStrategy,
    InitiateRegistrationUseCase,
    VerifyRegistrationOtpUseCase,
    CompleteRegistrationUseCase,
  ],
  exports: [AuthService],
})
export class AuthModule {}
