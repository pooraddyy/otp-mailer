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
            `Tap the link below to confirm this email belongs to you:`,
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

  private layout(organization: string, inner: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${organization}</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0b1220;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${organization} email verification</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f5f7;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:#ffffff;border-radius:16px;border:1px solid #e6e8ec;overflow:hidden;box-shadow:0 12px 32px -16px rgba(11,18,32,0.10);">
          <tr>
            <td style="padding:32px 36px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size:11.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#5b6577;">${organization}</td>
                </tr>
              </table>
            </td>
          </tr>
          ${inner}
          <tr>
            <td style="background:#fafbfc;padding:20px 36px;border-top:1px solid #eef0f3;">
              <p style="font-size:11.5px;color:#8a93a3;margin:0;text-align:center;line-height:1.55;">
                Didn't request this? You can safely ignore this email.<br/>
                &copy; ${new Date().getFullYear()} ${organization}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  private codeOnlyTemplate(otp: string, organization: string, minutesLabel: string): string {
    const inner = `
      <tr>
        <td style="padding:14px 36px 6px;">
          <h1 style="font-size:22px;font-weight:700;color:#0b1220;margin:0 0 8px;letter-spacing:-0.012em;line-height:1.3;">Your verification code</h1>
          <p style="font-size:14.5px;color:#5b6577;line-height:1.6;margin:0;">Use the code below to finish verifying your email. It works only once.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 36px 4px;">
          <div style="background:#0b1220;color:#ffffff;padding:22px;border-radius:12px;text-align:center;letter-spacing:.42em;font-size:30px;font-weight:700;font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;">${otp}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 36px 28px;">
          <p style="font-size:12.5px;color:#8a93a3;margin:0;text-align:center;line-height:1.6;">Expires in <strong style="color:#5b6577;">${minutesLabel}</strong>. Never share this code with anyone.</p>
        </td>
      </tr>`;
    return this.layout(organization, inner);
  }

  private linkOnlyTemplate(verifyUrl: string, organization: string, minutesLabel: string): string {
    const inner = `
      <tr>
        <td style="padding:14px 36px 6px;">
          <h1 style="font-size:22px;font-weight:700;color:#0b1220;margin:0 0 8px;letter-spacing:-0.012em;line-height:1.3;">Verify your email</h1>
          <p style="font-size:14.5px;color:#5b6577;line-height:1.6;margin:0;">Tap the button below to confirm this email belongs to you. It only takes one click.</p>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:26px 36px 8px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td bgcolor="#0b1220" style="border-radius:10px;">
                <a href="${verifyUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#0b1220;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 36px;border-radius:10px;letter-spacing:.005em;">Verify my email</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 36px 8px;">
          <p style="font-size:12px;color:#8a93a3;margin:0 0 6px;text-align:center;letter-spacing:.04em;text-transform:uppercase;font-weight:600;">Or copy this link</p>
          <div style="background:#f4f5f7;border:1px solid #e6e8ec;border-radius:8px;padding:10px 12px;word-break:break-all;font-size:11.5px;line-height:1.55;color:#5b6577;font-family:'SFMono-Regular',Consolas,Menlo,monospace;text-align:center;">
            <a href="${verifyUrl}" style="color:#0b1220;text-decoration:none;">${verifyUrl}</a>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 36px 28px;">
          <p style="font-size:12.5px;color:#8a93a3;margin:0;text-align:center;line-height:1.6;">Link expires in <strong style="color:#5b6577;">${minutesLabel}</strong>.</p>
        </td>
      </tr>`;
    return this.layout(organization, inner);
  }
}

export default SendMailController;
