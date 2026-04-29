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
        ? [
            `Your ${organization} verification code`,
            ``,
            `   ${otp}`,
            ``,
            `Enter this code in the app to confirm your email address.`,
            `It expires in ${minutesLabel}.`,
            ``,
            `Didn't request this? You can safely ignore this email.`,
          ].join('\n')
        : [
            `Verify your email for ${organization}`,
            ``,
            `Open the link below to confirm this email belongs to you:`,
            `${verifyUrl}`,
            ``,
            `The link expires in ${minutesLabel}.`,
            ``,
            `Didn't request this? You can safely ignore this email.`,
          ].join('\n');

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
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #ffffff;
        color: #000000;
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
      }
      .wrapper { padding: 60px 20px; background-color: #ffffff; }
      .container {
        max-width: 460px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        border: 1px solid #000000;
      }
      .header {
        padding: 38px 24px 22px;
        text-align: center;
        border-bottom: 1px solid #000000;
      }
      .header h1 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        letter-spacing: -0.01em;
        color: #000000;
      }
      .content { padding: 32px 40px 36px; text-align: center; }
      .label {
        font-size: 11.5px;
        font-weight: 700;
        color: #000000;
        margin-bottom: 22px;
        text-transform: uppercase;
        letter-spacing: 0.18em;
      }
      .info {
        font-size: 13px;
        color: #333333;
        line-height: 1.65;
        margin-top: 22px;
      }
      .footer {
        background-color: #ffffff;
        padding: 22px 20px;
        text-align: center;
        font-size: 11px;
        color: #666666;
        border-top: 1px solid #000000;
      }
      .footer p { margin: 4px 0; }
      .brand { color: #000000; font-weight: 700; letter-spacing: 0.04em; }
    `;
  }

  private codeOnlyTemplate(otp: string, organization: string, minutesLabel: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${organization}</title>
  <style>
    ${this.baseStyles()}
    .otp-container {
      background-color: #ffffff;
      padding: 20px 0;
      border-radius: 8px;
      margin-bottom: 4px;
      border: 2px dashed #000000;
    }
    .otp {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace;
      font-size: 30px;
      font-weight: 700;
      color: #000000;
      letter-spacing: 0.22em;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>${organization}</h1>
      </div>
      <div class="content">
        <div class="label">Verification Code</div>
        <div class="otp-container">
          <div class="otp">${otp}</div>
        </div>
        <div class="info">
          This code expires in ${minutesLabel}.<br>
          If you didn't request this, you can safely ignore this email.
        </div>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} <span class="brand">${organization}</span>. All rights reserved.</p>
      </div>
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
  <meta name="x-apple-disable-message-reformatting">
  <title>${organization}</title>
  <style>
    ${this.baseStyles()}
    .btn-wrap { padding: 6px 0 4px; }
    .btn {
      display: inline-block;
      background-color: #000000;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 14.5px;
      font-weight: 600;
      letter-spacing: 0.01em;
      padding: 14px 36px;
      border-radius: 8px;
      border: 2px solid #000000;
    }
    .fallback-label {
      font-size: 10.5px;
      font-weight: 700;
      color: #000000;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      margin: 26px 0 10px;
    }
    .fallback {
      background-color: #ffffff;
      border: 2px dashed #000000;
      border-radius: 8px;
      padding: 12px 14px;
      word-break: break-all;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace;
      font-size: 11.5px;
      line-height: 1.55;
      color: #000000;
    }
    .fallback a { color: #000000; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>${organization}</h1>
      </div>
      <div class="content">
        <div class="label">Verify Your Email</div>
        <div class="btn-wrap">
          <a class="btn" href="${verifyUrl}" target="_blank" rel="noopener noreferrer">Verify my email</a>
        </div>
        <div class="fallback-label">Or copy this link</div>
        <div class="fallback">
          <a href="${verifyUrl}">${verifyUrl}</a>
        </div>
        <div class="info">
          This link expires in ${minutesLabel}.<br>
          If you didn't request this, you can safely ignore this email.
        </div>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} <span class="brand">${organization}</span>. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
  }
}

export default SendMailController;
