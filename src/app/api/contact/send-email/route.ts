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

export async function POST(req: Request) {
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

  const toEmail = process.env.CONTACT_EMAIL_TO || "atelemedicine30@gmail.com";
  const smtpUser = process.env.CONTACT_EMAIL_USER || toEmail;
  const smtpPass = process.env.CONTACT_EMAIL_PASS;

  if (!smtpUser || !smtpPass) {
    return NextResponse.json(
      { message: "Email service is not configured" },
      { status: 500 }
    );
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

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
      from: `Pyet Doktorin <${smtpUser}>`,
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
