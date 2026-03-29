import { NextRequest, NextResponse } from "next/server";
import { ANALYTICS_CONSENT_COOKIE_NAME, COOKIE_SAMESITE, getCookieDomain } from "@/config/cookies";
import { applyRateLimitHeaders, getClientIp, rateLimit } from "@/app/api/_lib/rateLimit";
import { getOrCreateRequestId } from "@/app/api/_lib/requestId";

type ConsentValue = "granted" | "denied";

function isHttpsRequest(request: NextRequest): boolean {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0].trim().toLowerCase() === "https";
  return request.nextUrl.protocol === "https:";
}

export async function POST(request: NextRequest) {
  const requestId = getOrCreateRequestId(request);
  const ip = getClientIp(request);
  const limit = rateLimit({ key: `consent:${ip}`, windowMs: 60_000, max: 60 });
  if (!limit.allowed) {
    const res = NextResponse.json({ ok: false, error: "RATE_LIMITED", requestId }, { status: 429 });
    applyRateLimitHeaders(res.headers, limit);
    res.headers.set("x-request-id", requestId);
    return res;
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    const res = NextResponse.json({ error: "Invalid JSON", requestId }, { status: 400 });
    res.headers.set("x-request-id", requestId);
    return res;
  }

  const analytics = (payload as { analytics?: unknown } | null)?.analytics;
  if (analytics !== "granted" && analytics !== "denied") {
    const res = NextResponse.json({ error: "Invalid consent value", requestId }, { status: 400 });
    res.headers.set("x-request-id", requestId);
    return res;
  }

  const response = NextResponse.json({ ok: true, requestId });
  response.cookies.set(ANALYTICS_CONSENT_COOKIE_NAME, analytics satisfies ConsentValue, {
    path: "/",
    maxAge: 60 * 60 * 24,
    sameSite: COOKIE_SAMESITE,
    secure: isHttpsRequest(request),
    httpOnly: false,
    domain: getCookieDomain(request.nextUrl.hostname),
  });
  response.headers.set("x-request-id", requestId);

  return response;
}
