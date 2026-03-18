import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '@modules/auth/strategies/jwt.strategy';
import { Module } from '@nestjs/common';
import { User } from '@domain/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { RedisModule } from '@infrastructure/cache/redis.module';
import { ActivityModule } from '@infrastructure/activity/activity.module';
import { WalletController } from '@modules/wallet/wallet.controller';
import { GetMyBalancesUseCase } from '@modules/wallet/use-cases/get-my-balances.use-case';
import { WALLET_REPOSITORY } from '@domain/repositories/wallet.repository.interface';
import { WalletRepository } from '@infrastructure/database/repositories/wallet.repository';
import { Wallet } from '@domain/entities/wallet.entity';
import { WalletBalance } from '@domain/entities/wallet-balance.entity';
import { FundWalletUseCase } from '@modules/wallet/use-cases/fund-wallet.use-case';
import { TransactionRecord } from '@domain/entities/transaction-record.entity';
import { AddWalletUseCase } from '@modules/wallet/use-cases/add-new-wallet.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, WalletBalance, TransactionRecord]),
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
  controllers: [WalletController],
  providers: [
    JwtStrategy,
    JwtAuthGuard,
    GetMyBalancesUseCase,
    FundWalletUseCase,
    AddWalletUseCase,
    { provide: WALLET_REPOSITORY, useClass: WalletRepository },
  ],
  exports: [WALLET_REPOSITORY],
})
export class WalletModule {}
