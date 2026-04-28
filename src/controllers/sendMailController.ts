import nodemailer, { Transporter } from 'nodemailer';
import logger from '../utils/logger';

export interface SendMailOptions {
  email: string;
  otp: string;
  organization: string;
  subject: string;
  validityMinutes: number;
  verifyUrl: string;
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
    const { email, otp, organization, subject, validityMinutes, verifyUrl } = opts;
    try {
      const mailOptions = {
        from: `"${organization}" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: subject,
        text:
          `Your OTP is ${otp}\n\n` +
          `Or click this secure link to verify directly:\n${verifyUrl}\n\n` +
          `This code and link expire in ${validityMinutes} minute${validityMinutes === 1 ? '' : 's'}.`,
        html: this.generateHtmlTemplate(otp, organization, validityMinutes, verifyUrl),
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Sent OTP to ${email}`);
    } catch (error: any) {
      logger.error(`Failed to send OTP to ${email}:`, error.message);
      throw new Error(`Failed to send OTP to ${email}`);
    }
  }

  private generateHtmlTemplate(
    otp: string,
    organization: string,
    validityMinutes: number,
    verifyUrl: string
  ): string {
    const minutesLabel = `${validityMinutes} minute${validityMinutes === 1 ? '' : 's'}`;
    return `
      <!DOCTYPE html>
      <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${organization} OTP</title>
              <style>
                  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

                  body {
                      font-family: 'Inter', -apple-system, sans-serif;
                      background-color: #ffffff;
                      color: #000000;
                      margin: 0;
                      padding: 0;
                      -webkit-font-smoothing: antialiased;
                  }
                  .wrapper {
                      padding: 60px 20px;
                      background-color: #ffffff;
                  }
                  .container {
                      max-width: 440px;
                      margin: 0 auto;
                      background-color: #ffffff;
                      border-radius: 12px;
                      overflow: hidden;
                      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
                      border: 1px solid #000000;
                  }
                  .header {
                      padding: 40px 20px 20px;
                      text-align: center;
                      border-bottom: 1px solid #000000;
                  }
                  .header h1 {
                      margin: 0;
                      font-size: 18px;
                      font-weight: 700;
                      letter-spacing: -0.02em;
                      color: #000000;
                  }
                  .content {
                      padding: 30px 40px 40px;
                      text-align: center;
                  }
                  .label {
                      font-size: 12px;
                      font-weight: 600;
                      color: #444444;
                      margin-bottom: 20px;
                      text-transform: uppercase;
                      letter-spacing: 0.08em;
                  }
                  .otp-container {
                      background-color: #ffffff;
                      padding: 18px 0;
                      border-radius: 8px;
                      margin-bottom: 24px;
                      border: 2px dashed #000000;
                  }
                  .otp {
                      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace;
                      font-size: 30px;
                      font-weight: 700;
                      color: #000000;
                      letter-spacing: 0.2em;
                  }
                  .divider {
                      display: flex;
                      align-items: center;
                      text-align: center;
                      margin: 18px 0;
                      color: #888888;
                      font-size: 11px;
                      letter-spacing: 0.12em;
                      text-transform: uppercase;
                  }
                  .divider::before,
                  .divider::after {
                      content: "";
                      flex: 1;
                      border-bottom: 1px solid #e5e5e5;
                  }
                  .divider:not(:empty)::before { margin-right: 12px; }
                  .divider:not(:empty)::after { margin-left: 12px; }
                  .verify-btn {
                      display: inline-block;
                      background-color: #000000;
                      color: #ffffff !important;
                      text-decoration: none;
                      padding: 14px 28px;
                      border-radius: 8px;
                      font-size: 14px;
                      font-weight: 600;
                      letter-spacing: 0.02em;
                      margin-bottom: 22px;
                  }
                  .verify-fallback {
                      font-size: 11px;
                      color: #666666;
                      word-break: break-all;
                      margin-bottom: 24px;
                  }
                  .verify-fallback a {
                      color: #000000;
                  }
                  .info {
                      font-size: 13px;
                      color: #333333;
                      line-height: 1.6;
                  }
                  .footer {
                      background-color: #ffffff;
                      padding: 24px 20px;
                      text-align: center;
                      font-size: 11px;
                      color: #666666;
                      border-top: 1px solid #000000;
                  }
                  .footer p {
                      margin: 4px 0;
                  }
                  .brand {
                      color: #000000;
                      font-weight: 600;
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

                          <div class="divider">or</div>

                          <a class="verify-btn" href="${verifyUrl}" target="_blank" rel="noopener noreferrer">
                              Verify my email
                          </a>
                          <div class="verify-fallback">
                              If the button doesn't work, copy &amp; paste this link:<br>
                              <a href="${verifyUrl}">${verifyUrl}</a>
                          </div>

                          <div class="info">
                              This code and link expire in ${minutesLabel}.<br>
                              If you didn't request this, you can safely ignore this email.
                          </div>
                      </div>
                      <div class="footer">
                          <p>&copy; ${new Date().getFullYear()} <span class="brand">${organization}</span>. All rights reserved.</p>
                      </div>
                  </div>
              </div>
          </body>
      </html>
    `;
  }
}

export default SendMailController;
