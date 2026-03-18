import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { render } from '@react-email/render';
import * as React from 'react';
import { ResendService } from '@infrastructure/external/mailer/resend.service';
import { OtpEmail } from '@infrastructure/external/mailer/templates/otp-email';

@Processor('mailer')
export class MailProcessor extends WorkerHost {
  constructor(private readonly resendService: ResendService) {
    super();
  }

  async process(job: Job<{ email: string; otp: string }>) {
    const { email, otp } = job.data;

    const html = await render(React.createElement(OtpEmail, { otp }));

    await this.resendService.sendEmail(email, 'Verify your FX Trading Account', html);

    return { sent: true };
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    console.error(`Mail Job ${job.id} failed: ${error.message}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log(`Mail Job ${job.id} sent successfully to ${job.data.email}`);
  }
}
