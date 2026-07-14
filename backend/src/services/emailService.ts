import nodemailer from 'nodemailer';

function getEmailTransportConfig() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT ?? '587') || 587;
  const smtpSecure = (process.env.SMTP_SECURE ?? '').toLowerCase() === 'true' || smtpPort === 465;
  const smtpUser = process.env.SMTP_USER || process.env.CONTACT_EMAIL_USER || '';
  const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.CONTACT_EMAIL_PASS || '';
  const smtpService = process.env.SMTP_SERVICE;

  if (smtpHost) {
    return {
      kind: 'smtp' as const,
      config: {
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
      },
      smtpUser,
      smtpPass,
    };
  }

  if (smtpService || smtpUser) {
    return {
      kind: 'service' as const,
      config: {
        service: smtpService || 'gmail',
        auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
      },
      smtpUser,
      smtpPass,
    };
  }

  return { kind: 'none' as const, config: null, smtpUser, smtpPass };
}

type SendPlatformEmailArgs = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

export async function sendPlatformEmail({ to, subject, text, replyTo }: SendPlatformEmailArgs): Promise<void> {
  const fromEmail = process.env.CONTACT_EMAIL_FROM || process.env.MAIL_FROM || to;
  const transport = getEmailTransportConfig();

  if (transport.kind === 'none' || !transport.smtpUser || !transport.smtpPass) {
    const error = new Error('EMAIL_SERVICE_NOT_CONFIGURED');
    error.name = 'EmailConfigurationError';
    throw error;
  }

  const transporter = nodemailer.createTransport(transport.config as nodemailer.TransportOptions);

  await transporter.sendMail({
    from: `Pyet Doktorin <${fromEmail}>`,
    to,
    replyTo,
    subject,
    text,
  });
}
