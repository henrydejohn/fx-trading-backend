import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ACTIVITY_QUEUE } from '@infrastructure/queue/queue.constants';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(@InjectQueue(ACTIVITY_QUEUE) private readonly queue: Queue) {}

  log(userId: string, event: string, metadata: Record<string, any> = {}) {
    this.queue.add('record', { userId, event, metadata }).catch((err) => {
      this.logger.error(`Failed to queue activity for user ${userId}`, err.stack);
    });
  }
}
