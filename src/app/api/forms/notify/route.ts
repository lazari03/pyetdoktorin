import { NextResponse } from "next/server";
import { applyRateLimitHeaders, getClientIp, rateLimit } from "@/app/api/_lib/rateLimit";
import { getOrCreateRequestId } from "@/app/api/_lib/requestId";
import {
  getEmailConfigurationHint,
  isOriginAllowed,
  isValidEmail,
  sendPlatformEmail,
} from "@/app/api/_lib/email";

export const runtime = "nodejs";

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 20;
const REDACTED = "[redacted]";

type FormNotificationPayload = {
  formType?: string;
  source?: string;
  subject?: string;
  replyTo?: string;
  data?: Record<string, unknown>;
};

function sanitizeKey(key: string): string {
  return key.trim().slice(0, 120);
}

function sanitizeText(value: string, max = 1000): string {
  return value.trim().slice(0, max);
}

function isSensitiveKey(key: string): boolean {
  return /(password|passcode|secret|token|credential)/i.test(key);
}

function sanitizeValue(key: string, value: unknown): unknown {
  if (isSensitiveKey(key)) return REDACTED;

  if (typeof value === "string") {
    if (value.startsWith("data:")) {
      return "[omitted data-url]";
    }
    return sanitizeText(value, 4000);
  }

  if (typeof value === "number" || typeof value === "boolean" || value === null) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.slice(0, 50).map((entry) => sanitizeValue(key, entry));
  }

  if (typeof value === "object" && value) {
    return sanitizeRecord(value as Record<string, unknown>);
  }

  return String(value);
}

function sanitizeRecord(data: Record<string, unknown>): Record<string, unknown> {
  return Object.entries(data).slice(0, 100).reduce<Record<string, unknown>>((acc, [key, value]) => {
    const safeKey = sanitizeKey(key);
    if (!safeKey) return acc;
    acc[safeKey] = sanitizeValue(safeKey, value);
    return acc;
  }, {});
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
  const limit = rateLimit({ key: `forms:${ip}`, windowMs: RATE_WINDOW_MS, max: RATE_MAX });
  if (!limit.allowed) {
    const res = NextResponse.json({ message: "Too many requests. Please try again later.", requestId }, { status: 429 });
    applyRateLimitHeaders(res.headers, limit);
    res.headers.set("x-request-id", requestId);
    return res;
  }

  let payload: FormNotificationPayload;
  try {
    payload = await req.json();
  } catch {
    const res = NextResponse.json({ message: "Invalid request body", requestId }, { status: 400 });
    res.headers.set("x-request-id", requestId);
    return res;
  }

  const formType = sanitizeText(payload.formType || "", 120);
  const source = sanitizeText(payload.source || "", 120);
  const subject = sanitizeText(payload.subject || "", 200);
  const replyTo = sanitizeText(payload.replyTo || "", 200);
  const data = payload.data && typeof payload.data === "object" ? sanitizeRecord(payload.data) : null;

  if (!formType || !data || Object.keys(data).length === 0) {
    const res = NextResponse.json({ message: "Missing required fields", requestId }, { status: 400 });
    res.headers.set("x-request-id", requestId);
    return res;
  }

  if (replyTo && !isValidEmail(replyTo)) {
    const res = NextResponse.json({ message: "Invalid reply-to email address", requestId }, { status: 400 });
    res.headers.set("x-request-id", requestId);
    return res;
  }

  const toEmail = process.env.FORM_NOTIFICATION_EMAIL_TO || process.env.CONTACT_EMAIL_TO || "info@pyetdoktorin.al";
  const finalSubject = subject || `New form submission: ${formType}`;
  const text = [
    "New Form Submission",
    `Form: ${formType}`,
    source ? `Source: ${source}` : null,
    `Submitted at: ${new Date().toISOString()}`,
    "",
    "Payload:",
    JSON.stringify(data, null, 2),
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await sendPlatformEmail({
      to: toEmail,
      subject: finalSubject,
      text,
      replyTo: replyTo || undefined,
    });
    const res = NextResponse.json({ ok: true, requestId });
    res.headers.set("x-request-id", requestId);
    return res;
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_SERVICE_NOT_CONFIGURED") {
      const res = NextResponse.json(
        { message: "Email service is not configured", hint: getEmailConfigurationHint(), requestId },
        { status: 503 }
      );
      res.headers.set("x-request-id", requestId);
      return res;
    }

    console.error("[forms.notify] Failed to send", { requestId, formType, source });
    const res = NextResponse.json({ message: "Failed to send email", requestId }, { status: 500 });
    res.headers.set("x-request-id", requestId);
    return res;
  }
}
