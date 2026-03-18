import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '@domain/entities/user.entity';
import { UserSession } from '@domain/entities/user-session.entity';
import { UserRepository } from '@infrastructure/database/repositories/user.repository';
import { UserSessionRepository } from '@infrastructure/database/repositories/user-session.repository';
import { USER_SESSION_REPOSITORY } from '@domain/repositories/user-session.repository.interface';
import { USER_REPOSITORY } from '@domain/repositories/user.repository.interface';
import { Wallet } from '@domain/entities/wallet.entity';
import { WalletBalance } from '@domain/entities/wallet-balance.entity';
import { UserActivity } from '@domain/entities/user-activity.entity';
import { TransactionRecord } from '@domain/entities/transaction-record.entity';
import { WALLET_REPOSITORY } from '@domain/repositories/wallet.repository.interface';
import { WalletRepository } from '@infrastructure/database/repositories/wallet.repository';

const entities = [User, UserSession, Wallet, WalletBalance, UserActivity, TransactionRecord];
const repositories = [
  { provide: USER_REPOSITORY, useClass: UserRepository },
  { provide: USER_SESSION_REPOSITORY, useClass: UserSessionRepository },
  { provide: WALLET_REPOSITORY, useClass: WalletRepository },
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.name'),
        entities,
        synchronize: config.get<string>('nodeEnv') === 'development',
        logging: config.get<string>('nodeEnv') === 'development',
        extra: {
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
      }),
    }),
    TypeOrmModule.forFeature(entities),
  ],
  providers: repositories,
  exports: repositories,
})
export class DatabaseModule {}
