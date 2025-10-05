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

  async send(template: () => nodemailer.SendMailOptions): Promise<void> {
    const mailOptions = template();

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${mailOptions.to as string}`, {
        context: MailerService.name,
        meta: { to: mailOptions.to },
      });
    } catch (err) {
      this.logger.error(
        `Failed to send email to ${mailOptions.to as string}: ${err}`,
        {
          context: MailerService.name,
          meta: { to: mailOptions.to },
        },
      );
      throw err;
    }
  }
}
