import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getClientIp, rateLimit } from "@/app/api/_lib/rateLimit";
import { getOrCreateRequestId } from "@/app/api/_lib/requestId";

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
  const requestId = getOrCreateRequestId(req);
  const origin = req.headers.get("origin");
  if (!isOriginAllowed(origin)) {
    const res = NextResponse.json({ message: "Forbidden", requestId }, { status: 403 });
    res.headers.set("x-request-id", requestId);
    return res;
  }

  const ip = getClientIp(req);
  const limit = rateLimit({ key: `contact:${ip}`, windowMs: RATE_WINDOW_MS, max: RATE_MAX });
  if (!limit.allowed) {
    const res = NextResponse.json({ message: "Too many requests. Please try again later.", requestId }, { status: 429 });
    res.headers.set("x-request-id", requestId);
    return res;
  }

  let payload: ContactPayload;
  try {
    payload = await req.json();
  } catch {
    const res = NextResponse.json({ message: "Invalid request body", requestId }, { status: 400 });
    res.headers.set("x-request-id", requestId);
    return res;
  }

  const name = (payload.name || "").trim().slice(0, 100);
  const email = (payload.email || "").trim().slice(0, 200);
  const message = (payload.message || "").trim().slice(0, 5000);
  const subject = (payload.subject || "").trim().slice(0, 140);
  const source = (payload.source || "").trim().slice(0, 120);
  if (!name || !email || !message) {
    const res = NextResponse.json({ message: "Missing required fields", requestId }, { status: 400 });
    res.headers.set("x-request-id", requestId);
    return res;
  }
  if (!isValidEmail(email)) {
    const res = NextResponse.json({ message: "Invalid email address", requestId }, { status: 400 });
    res.headers.set("x-request-id", requestId);
    return res;
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
      { message: "Email service is not configured", hint, requestId },
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
    const res = NextResponse.json({ ok: true, requestId });
    res.headers.set("x-request-id", requestId);
    return res;
  } catch {
    console.error("[contact.send-email] Failed to send", { requestId });
    const res = NextResponse.json({ message: "Failed to send email", requestId }, { status: 500 });
    res.headers.set("x-request-id", requestId);
    return res;
  }
}
