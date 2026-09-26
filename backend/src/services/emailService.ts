import nodemailer from 'nodemailer';

// Ethereal is a fake SMTP service, mostly aimed at Node.js developers.
let transporter: nodemailer.Transporter | null = null;

async function initTransporter() {
  if (transporter) return transporter;

  try {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
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

    console.log('Ethereal Email Transporter Initialized:', testAccount.user);
    return transporter;
  } catch (error) {
    console.error('Failed to create Ethereal account:', error);
    throw error;
  }
}

export async function sendAlertEmail(to: string, subject: string, text: string, html?: string) {
  try {
    const t = await initTransporter();
    const info = await t.sendMail({
      from: '"UrbanResq Alerts" <alerts@urbanresq.local>',
      to,
      subject,
      text,
      html: html || text,
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
