import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailProcessor } from '@infrastructure/queue/processors/mail.processor';
import { ResendService } from '@infrastructure/external/mailer/resend.service';
import { ActivityProcessor } from '@infrastructure/queue/processors/activity.processor';
import { ACTIVITY_QUEUE, MAILER_QUEUE, WALLET_QUEUE } from '@infrastructure/queue/queue.constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserActivity } from '@domain/entities/user-activity.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([UserActivity]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('redis.host'),
          port: config.get<number>('redis.port'),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: 100,
          removeOnFail: 500,
        },
      }),
    }),
    BullModule.registerQueue(
      { name: WALLET_QUEUE },
      { name: MAILER_QUEUE },
      { name: ACTIVITY_QUEUE },
    ),
  ],
  providers: [MailProcessor, ResendService, ActivityProcessor],
  exports: [BullModule],
})
export class QueueModule {}
