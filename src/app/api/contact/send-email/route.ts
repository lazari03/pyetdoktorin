import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/app/api/_lib/rateLimit";
import { getOrCreateRequestId } from "@/app/api/_lib/requestId";
import {
  getEmailConfigurationHint,
  isOriginAllowed,
  isValidEmail,
  sendPlatformEmail,
} from "@/app/api/_lib/email";

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
  const finalSubject =
    subject ||
    `New contact message${name ? ` from ${name}` : ""}`;
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
    await sendPlatformEmail({
      to: toEmail,
      replyTo: email,
      subject: finalSubject,
      text,
    });
    const res = NextResponse.json({ ok: true, requestId });
    res.headers.set("x-request-id", requestId);
    return res;
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_SERVICE_NOT_CONFIGURED") {
      const hint = getEmailConfigurationHint();
      const res = NextResponse.json(
        { message: "Email service is not configured", hint, requestId },
        { status: 503 }
      );
      res.headers.set("x-request-id", requestId);
      return res;
    }

    console.error("[contact.send-email] Failed to send", { requestId });
    const res = NextResponse.json(
      { message: "Failed to send email", requestId },
      { status: 500 }
    );
    res.headers.set("x-request-id", requestId);
    return res;
  }
}
