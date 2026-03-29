import { NextRequest, NextResponse } from "next/server";
import { applyRateLimitHeaders, getClientIp, rateLimit } from "@/app/api/_lib/rateLimit";
import { getOrCreateRequestId } from "@/app/api/_lib/requestId";
import { emitClientErrorEvent } from "@/app/api/_lib/logSink";

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser clients
  try {
    const o = new URL(origin);
    return o.host === request.nextUrl.host;
  } catch {
    return false;
  }
}

function truncate(value: unknown, maxLen: number): string | undefined {
  if (typeof value !== "string") return undefined;
  if (value.length <= maxLen) return value;
  return value.slice(0, maxLen);
}

export async function POST(request: NextRequest) {
  const requestId = getOrCreateRequestId(request);
  if (!isSameOrigin(request)) {
    const res = NextResponse.json({ ok: false, error: "FORBIDDEN", requestId }, { status: 403 });
    res.headers.set("x-request-id", requestId);
    return res;
  }

  const ip = getClientIp(request);
  const limit = rateLimit({ key: `client-error:${ip}`, windowMs: 60_000, max: 30 });
  if (!limit.allowed) {
    const res = NextResponse.json({ ok: false, error: "RATE_LIMITED", requestId }, { status: 429 });
    applyRateLimitHeaders(res.headers, limit);
    res.headers.set("x-request-id", requestId);
    return res;
  }

  const text = await request.text();
  if (text.length > 25_000) {
    const res = NextResponse.json({ ok: false, error: "PAYLOAD_TOO_LARGE", requestId }, { status: 413 });
    res.headers.set("x-request-id", requestId);
    return res;
  }

  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    const res = NextResponse.json({ ok: false, error: "INVALID_JSON", requestId }, { status: 400 });
    res.headers.set("x-request-id", requestId);
    return res;
  }

  const body = payload as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    const res = NextResponse.json({ ok: false, error: "INVALID_BODY", requestId }, { status: 400 });
    res.headers.set("x-request-id", requestId);
    return res;
  }

  const report = {
    id: truncate(body.id, 200),
    requestId: truncate(body.requestId, 200),
    type: truncate(body.type, 100),
    message: truncate(body.message, 2000),
    stack: truncate(body.stack, 20_000),
    digest: truncate(body.digest, 200),
    path: truncate(body.path, 500),
    userAgent: truncate(body.userAgent, 500),
    timestamp: truncate(body.timestamp, 100),
  };

  // IMPORTANT: Avoid logging request cookies/headers to reduce risk of leaking sensitive data.
  console.error("[client-error]", { apiRequestId: requestId, ...report });
  void emitClientErrorEvent({
    kind: "client_error",
    level: "error",
    apiRequestId: requestId,
    requestId: report.requestId,
    id: report.id,
    type: report.type,
    message: report.message,
    stack: report.stack,
    digest: report.digest,
    path: report.path,
    userAgent: report.userAgent,
    timestamp: report.timestamp,
  });

  const res = NextResponse.json({ ok: true, requestId });
  res.headers.set("x-request-id", requestId);
  return res;
}
