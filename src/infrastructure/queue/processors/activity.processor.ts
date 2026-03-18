import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserActivity } from '@domain/entities/user-activity.entity';
import { ACTIVITY_QUEUE } from '@infrastructure/queue/queue.constants';

@Processor(ACTIVITY_QUEUE)
export class ActivityProcessor extends WorkerHost {
  constructor(
    @InjectRepository(UserActivity)
    private readonly activityRepo: Repository<UserActivity>,
  ) {
    super();
  }

  async process(job: Job<{ userId: string; event: string; metadata?: any }>) {
    const { userId, event, metadata } = job.data;

    const activity = this.activityRepo.create({
      userId: userId || '00000000-0000-0000-0000-000000000000',
      event: event || 'unknown.event',
      metadata: metadata || {},
    });

    try {
      await this.activityRepo.save(activity);
    } catch (error) {
      console.error(`Database save failed for activity log: ${error.message}`);
      throw error;
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    console.error(`Activity Log Job ${job.id} failed: ${error.message}`);
  }
}
