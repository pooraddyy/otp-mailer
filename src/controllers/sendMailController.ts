import nodemailer, { Transporter } from 'nodemailer';
import logger from '../utils/logger';

export type EmailMode = 'code' | 'link';

export interface SendMailOptions {
  email: string;
  organization: string;
  subject: string;
  validityMinutes: number;
  mode: EmailMode;
  otp?: string;
  verifyUrl?: string;
}

class SendMailController {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: process.env.GMAIL_USER as string,
        pass: process.env.GMAIL_PASS as string,
      },
      pool: true,
    });
  }

  async sendMail(opts: SendMailOptions): Promise<void> {
    const { email, organization, subject, validityMinutes, mode, otp, verifyUrl } = opts;

    if (mode === 'code' && !otp) {
      throw new Error('OTP code is required for code mode');
    }
    if (mode === 'link' && !verifyUrl) {
      throw new Error('Verify URL is required for link mode');
    }

    const minutesLabel = `${validityMinutes} minute${validityMinutes === 1 ? '' : 's'}`;

    const text =
      mode === 'code'
        ? `Your verification code is ${otp}\n\nThis code expires in ${minutesLabel}.\n\nIf you didn't request this, you can safely ignore this email.`
        : `Verify your email by clicking the link below:\n${verifyUrl}\n\nThis link expires in ${minutesLabel}.\n\nIf you didn't request this, you can safely ignore this email.`;

    const html =
      mode === 'code'
        ? this.codeOnlyTemplate(otp as string, organization, minutesLabel)
        : this.linkOnlyTemplate(verifyUrl as string, organization, minutesLabel);

    try {
      await this.transporter.sendMail({
        from: `"${organization}" <${process.env.GMAIL_USER}>`,
        to: email,
        subject,
        text,
        html,
      });
      logger.info(`Sent ${mode}-mode verification email to ${email}`);
    } catch (error: any) {
      logger.error(`Failed to send email to ${email}:`, error.message);
      throw new Error(`Failed to send email to ${email}`);
    }
  }

  private baseStyles(): string {
    return `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f3f4f6; color: #0f172a; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
      .wrapper { padding: 40px 16px; background: #f3f4f6; }
      .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 6px 24px -8px rgba(15,23,42,0.10); }
      .header { padding: 28px 32px 8px; }
      .brand-tag { font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #6b7280; }
      .heading { font-size: 22px; font-weight: 800; letter-spacing: -0.01em; margin: 10px 0 6px; color: #0f172a; }
      .lead { font-size: 14.5px; color: #475569; line-height: 1.6; margin: 0; }
      .content { padding: 12px 32px 24px; }
      .info { font-size: 12.5px; color: #6b7280; line-height: 1.6; text-align: center; margin: 18px 0 0; }
      .footer { background: #f9fafb; padding: 16px 32px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #94a3b8; }
    `;
  }

  private codeOnlyTemplate(otp: string, organization: string, minutesLabel: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${organization} verification code</title>
  <style>
    ${this.baseStyles()}
    .otp-box { background: #0f172a; color: #ffffff; padding: 22px; border-radius: 12px; text-align: center; letter-spacing: .5em; font-size: 30px; font-weight: 700; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; margin: 18px 0 8px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="brand-tag">${organization}</div>
        <h1 class="heading">Your verification code</h1>
        <p class="lead">Enter this code in the app to verify your email address.</p>
      </div>
      <div class="content">
        <div class="otp-box">${otp}</div>
        <p class="info">This code expires in ${minutesLabel}.<br/>If you didn't request this, you can safely ignore this email.</p>
      </div>
      <div class="footer">&copy; ${new Date().getFullYear()} ${organization}</div>
    </div>
  </div>
</body>
</html>`;
  }

  private linkOnlyTemplate(verifyUrl: string, organization: string, minutesLabel: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${organization} verify your email</title>
  <style>
    ${this.baseStyles()}
    .btn-wrap { text-align: center; margin: 22px 0 12px; }
    .verify-btn { display: inline-block; background: #0f172a; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 600; letter-spacing: .01em; }
    .fallback { font-size: 11.5px; color: #6b7280; line-height: 1.55; text-align: center; word-break: break-all; margin-top: 10px; }
    .fallback a { color: #0f172a; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="brand-tag">${organization}</div>
        <h1 class="heading">Verify your email address</h1>
        <p class="lead">Tap the button below to confirm this email belongs to you. It only takes one click.</p>
      </div>
      <div class="content">
        <div class="btn-wrap">
          <a class="verify-btn" href="${verifyUrl}" target="_blank" rel="noopener noreferrer">Verify my email</a>
        </div>
        <p class="fallback">If the button doesn't work, copy &amp; paste this link:<br/><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p class="info">This link expires in ${minutesLabel}.<br/>If you didn't request this, you can safely ignore this email.</p>
      </div>
      <div class="footer">&copy; ${new Date().getFullYear()} ${organization}</div>
    </div>
  </div>
</body>
</html>`;
  }
}

export default SendMailController;
