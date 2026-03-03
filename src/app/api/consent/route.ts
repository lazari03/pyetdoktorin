import { NextRequest, NextResponse } from "next/server";
import { ANALYTICS_CONSENT_COOKIE_NAME, COOKIE_SAMESITE, getCookieDomain } from "@/config/cookies";

type ConsentValue = "granted" | "denied";

function isHttpsRequest(request: NextRequest): boolean {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0].trim().toLowerCase() === "https";
  return request.nextUrl.protocol === "https:";
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const analytics = (payload as { analytics?: unknown } | null)?.analytics;
  if (analytics !== "granted" && analytics !== "denied") {
    return NextResponse.json({ error: "Invalid consent value" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ANALYTICS_CONSENT_COOKIE_NAME, analytics satisfies ConsentValue, {
    path: "/",
    maxAge: 60 * 60 * 24,
    sameSite: COOKIE_SAMESITE,
    secure: isHttpsRequest(request),
    httpOnly: false,
    domain: getCookieDomain(request.nextUrl.hostname),
  });

  return response;
}
