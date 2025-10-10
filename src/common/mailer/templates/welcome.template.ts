import { SendMailOptions } from 'nodemailer';

export const welcomeTemplate = (
  email: string,
  firstName: string,
): SendMailOptions => ({
  from: '"Progress Path" <no-reply@yourdomain.com>',
  to: email,
  subject: `Welcome, ${firstName}!`,
  html: `
    <h1>Hi ${firstName}, welcome to Progress Path 🎉</h1>
    <p>We’re excited to have you on board!</p>
  `,
});
