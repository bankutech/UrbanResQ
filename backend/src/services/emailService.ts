import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;
let etherealFailed = false;

async function initTransporter(): Promise<nodemailer.Transporter | null> {
  if (transporter) return transporter;

  // 1. If custom SMTP configured via environment
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS || '',
      } : undefined,
    });
    return transporter;
  }

  // 2. If Ethereal already failed in this session, don't spam requests
  if (etherealFailed) return null;

  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('[email] Ethereal Email Transporter Initialized:', testAccount.user);
    return transporter;
  } catch (error: any) {
    etherealFailed = true;
    console.warn('[email] SMTP offline/unavailable; notifications will log to console:', error?.message || error);
    return null;
  }
}

export async function sendAlertEmail(to: string, subject: string, text: string, html?: string) {
  try {
    const t = await initTransporter();
    if (!t) {
      console.log(`[email:dry-run] To: ${to} | Subject: "${subject}" | Message: ${text}`);
      return { messageId: `mock-${Date.now()}` };
    }

    const info = await t.sendMail({
      from: process.env.MAIL_FROM || '"UrbanResq Alerts" <alerts@urbanresq.local>',
      to,
      subject,
      text,
      html: html || text,
    });

    console.log('[email] Alert sent: %s', info.messageId);
    return info;
  } catch (error: any) {
    console.error('[email] Error sending email:', error?.message || error);
  }
}
