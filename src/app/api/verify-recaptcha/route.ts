import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const allowRecaptchaBypass =
    process.env.RECAPTCHA_OPTIONAL === "true" ||
    process.env.NEXT_PUBLIC_RECAPTCHA_OPTIONAL === "true";

  if (allowRecaptchaBypass) {
    return NextResponse.json({ success: true, bypassed: true });
  }

  let token = "";
  try {
    const body = (await req.json()) as { token?: string };
    token = (body?.token || "").trim();
  } catch {
    return NextResponse.json({ success: false, error: "invalid_body" }, { status: 400 });
  }

  const secret = (process.env.RECAPTCHA_SECRET_KEY || "").trim();
  if (!token || !secret) {
    return NextResponse.json({ success: false, error: "missing_token_or_secret" }, { status: 400 });
  }

  try {
    const params = new URLSearchParams();
    params.set("secret", secret);
    params.set("response", token);

    const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await verifyRes.json();
    if (!data?.success) {
      return NextResponse.json(
        { success: false, error: "verification_failed", codes: data?.["error-codes"] || [] },
        { status: 400 }
      );
    }

    if (typeof data?.score === "number" && data.score < 0.5) {
      return NextResponse.json(
        { success: false, error: "low_score", score: data.score },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, score: data?.score ?? null });
  } catch (error) {
    console.error("reCAPTCHA verify error", error);
    return NextResponse.json({ success: false, error: "verify_error" }, { status: 500 });
  }
}
