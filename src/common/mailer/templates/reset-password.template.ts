import { SendMailOptions } from 'nodemailer';

export const resetPasswordTemplate = (
  email: string,
  resetLink: string,
): SendMailOptions => ({
  from: '"Progress Path" <no-reply@yourdomain.com>',
  to: email,
  subject: 'Reset your password',
  html: `
    <p>You requested a password reset. Click below to set a new password:</p>
    <a href="${resetLink}">${resetLink}</a>
    <p>This link will expire in 1 hour.</p>
  `,
});
