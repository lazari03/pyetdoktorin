import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
  subject?: string;
  source?: string;
};

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const rateBucket = new Map<string, { count: number; resetAt: number }>();

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

function isValidEmail(email: string): boolean {
  // Basic sanity check (avoid over-restrictive validation).
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
      // ignore malformed env value
    }
  }
  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }
  return Array.from(origins);
}

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // allow non-browser clients or same-origin calls without header
  const allowed = getAllowedOrigins();
  return allowed.includes(origin);
}

function getEmailTransportConfig() {
  // Prefer generic SMTP config. Fallback to a service-based transport (e.g. Gmail).
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT ?? "587") || 587;
  const smtpSecure = (process.env.SMTP_SECURE ?? "").toLowerCase() === "true" || smtpPort === 465;
  const smtpUser = process.env.SMTP_USER || process.env.CONTACT_EMAIL_USER || "";
  const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.CONTACT_EMAIL_PASS || "";
  const smtpService = process.env.SMTP_SERVICE; // e.g. "gmail"

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

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (!isOriginAllowed(origin)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = (forwardedFor?.split(",")[0] || req.headers.get("x-real-ip") || "unknown").trim();
  const now = Date.now();
  const bucket = rateBucket.get(ip);
  if (!bucket || bucket.resetAt < now) {
    rateBucket.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
  } else if (bucket.count >= RATE_MAX) {
    return NextResponse.json({ message: "Too many requests. Please try again later." }, { status: 429 });
  } else {
    bucket.count += 1;
  }

  let payload: ContactPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const name = (payload.name || "").trim().slice(0, 100);
  const email = (payload.email || "").trim().slice(0, 200);
  const message = (payload.message || "").trim().slice(0, 5000);
  const subject = (payload.subject || "").trim().slice(0, 140);
  const source = (payload.source || "").trim().slice(0, 120);
  if (!name || !email || !message) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ message: "Invalid email address" }, { status: 400 });
  }

  const toEmail = process.env.CONTACT_EMAIL_TO || "info@pyetdoktorin.al";
  const fromEmail = process.env.CONTACT_EMAIL_FROM || process.env.MAIL_FROM || toEmail;
  const transport = getEmailTransportConfig();

  if (transport.kind === "none" || !transport.smtpUser || !transport.smtpPass) {
    const hint =
      process.env.NODE_ENV === "production"
        ? undefined
        : "Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS (recommended) or CONTACT_EMAIL_USER/CONTACT_EMAIL_PASS.";
    return NextResponse.json(
      { message: "Email service is not configured", hint },
      { status: 503 }
    );
  }

  const transporter = nodemailer.createTransport(transport.config as nodemailer.TransportOptions);

  const finalSubject =
    subject ||
    `New contact message${name ? ` from ${name}` : ""}`;

  const html = `
    <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;">
      <h2 style="margin:0 0 12px;">New Contact Message</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      ${source ? `<p><strong>Source:</strong> ${escapeHtml(source)}</p>` : ""}
      <p><strong>Message:</strong></p>
      <p style="white-space:pre-wrap;">${escapeHtml(message)}</p>
    </div>
  `;

  const text = [
    "New Contact Message",
    `Name: ${name}`,
    `Email: ${email}`,
    source ? `Source: ${source}` : null,
    "",
    "Message:",
    message,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await transporter.sendMail({
      from: `Pyet Doktorin <${fromEmail}>`,
      to: toEmail,
      replyTo: email,
      subject: finalSubject,
      text,
      html,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { message: "Failed to send email" },
      { status: 500 }
    );
  }
}
