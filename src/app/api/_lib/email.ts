import nodemailer from "nodemailer";

export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getAllowedOrigins(): string[] {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  const origins = new Set<string>();

  if (siteUrl) {
    try {
      origins.add(new URL(siteUrl).origin);
    } catch {
      // Ignore malformed env value.
    }
  }

  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }

  return Array.from(origins);
}

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true;
  return getAllowedOrigins().includes(origin);
}

function getEmailTransportConfig() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT ?? "587") || 587;
  const smtpSecure = (process.env.SMTP_SECURE ?? "").toLowerCase() === "true" || smtpPort === 465;
  const smtpUser = process.env.SMTP_USER || process.env.CONTACT_EMAIL_USER || "";
  const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.CONTACT_EMAIL_PASS || "";
  const smtpService = process.env.SMTP_SERVICE;

  if (smtpHost) {
    return {
      kind: "smtp" as const,
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
      kind: "service" as const,
      config: {
        service: smtpService || "gmail",
        auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
      },
      smtpUser,
      smtpPass,
    };
  }

  return { kind: "none" as const, config: null, smtpUser, smtpPass };
}

export function getEmailConfigurationHint(): string | undefined {
  if (process.env.NODE_ENV === "production") return undefined;
  return "Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS (recommended) or CONTACT_EMAIL_USER/CONTACT_EMAIL_PASS.";
}

type SendPlatformEmailArgs = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

export async function sendPlatformEmail({ to, subject, text, replyTo }: SendPlatformEmailArgs) {
  const fromEmail = process.env.CONTACT_EMAIL_FROM || process.env.MAIL_FROM || to;
  const transport = getEmailTransportConfig();

  if (transport.kind === "none" || !transport.smtpUser || !transport.smtpPass) {
    const error = new Error("EMAIL_SERVICE_NOT_CONFIGURED");
    error.name = "EmailConfigurationError";
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
