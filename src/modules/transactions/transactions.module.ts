import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '@modules/auth/strategies/jwt.strategy';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { ActivityModule } from '@infrastructure/activity/activity.module';
import { TransactionRecord } from '@domain/entities/transaction-record.entity';
import { TransactionsController } from '@modules/transactions/transactions.controller';
import { GetMyTransactionsUseCase } from '@modules/transactions/use-cases/get-my-transactions.use-case';
import { TRANSACTION_REPOSITORY } from '@domain/repositories/transaction.repository.interface';
import { TransactionRepository } from '@infrastructure/database/repositories/transactions.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionRecord]),
    PassportModule,
    DatabaseModule,
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
  controllers: [TransactionsController],
  providers: [
    JwtStrategy,
    JwtAuthGuard,
    GetMyTransactionsUseCase,
    { provide: TRANSACTION_REPOSITORY, useClass: TransactionRepository },
  ],
  exports: [TRANSACTION_REPOSITORY],
})
export class TransactionModule {}
