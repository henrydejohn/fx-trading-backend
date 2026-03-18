import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserActivity } from '@domain/entities/user-activity.entity';
import { ActivityService } from './activity.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UserActivity])],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
