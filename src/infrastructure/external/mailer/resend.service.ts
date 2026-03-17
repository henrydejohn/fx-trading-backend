import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class ResendService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get('resend.apiKey'));
  }

  async sendEmail(to: string, subject: string, html: string) {
    return this.resend.emails.send({
      from: this.configService.get('resend.emailFrom')!,
      to,
      subject,
      html,
    });
  }
}
