import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import settings from '../../config/settings';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly logger: LoggerService) {
    void this.init();
  }

  private async init() {
    if (settings.NODE_ENV === 'development') {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('Ethereal test account created:', testAccount.user);
    } else {
      this.transporter = nodemailer.createTransport({
        host: settings.smtp.host,
        port: settings.smtp.port,
        secure: false,
        auth: {
          user: settings.smtp.user,
          pass: settings.smtp.pass,
        },
      });
    }
  }

  async sendPasswordReset(email: string, resetLink: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: '"Progress Path" <no-reply@yourdomain.com>',
        to: email,
        subject: 'Reset your password',
        html: `
          <p>You requested a password reset. Click below to set a new password:</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>This link will expire in 1 hour.</p>
        `,
      });

      this.logger.log(`Password reset email sent to ${email}`, {
        context: MailerService.name,
        meta: { email },
      });
    } catch (err) {
      this.logger.error(`Failed to send reset email to ${email}: ${err}`, {
        context: MailerService.name,
        meta: { email },
      });
      throw err;
    }
  }
}
