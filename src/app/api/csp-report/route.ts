import { NextResponse } from "next/server";
import { getAdmin } from "@/app/api/_lib/admin";

export const runtime = "nodejs";

type CspReportPayload = {
  "csp-report"?: {
    "document-uri"?: string;
    referrer?: string;
    "blocked-uri"?: string;
    "violated-directive"?: string;
    "effective-directive"?: string;
    "original-policy"?: string;
    disposition?: string;
    "status-code"?: number;
    "line-number"?: number;
    "column-number"?: number;
    "source-file"?: string;
    "script-sample"?: string;
  };
};

type ReportingApiItem = {
  type?: string;
  url?: string;
  user_agent?: string;
  body?: Record<string, unknown>;
};

function toSafeUrl(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    // If relative, resolve against dummy base.
    const u = new URL(trimmed, "https://example.invalid");
    // Strip query/hash to avoid accidentally storing identifiers.
    return `${u.origin}${u.pathname}`;
  } catch {
    // Some CSP fields can be schemes like "data" or "inline" or "eval".
    return trimmed.slice(0, 200);
  }
}

function pickReportFields(report: NonNullable<CspReportPayload["csp-report"]>) {
  const blocked = toSafeUrl(report["blocked-uri"]);
  const doc = toSafeUrl(report["document-uri"]);
  const source = toSafeUrl(report["source-file"]);
  const violated = typeof report["violated-directive"] === "string" ? report["violated-directive"].slice(0, 200) : null;
  const effective = typeof report["effective-directive"] === "string" ? report["effective-directive"].slice(0, 100) : null;
  const disposition = typeof report.disposition === "string" ? report.disposition.slice(0, 30) : null;
  const statusCode = typeof report["status-code"] === "number" ? report["status-code"] : null;
  const line = typeof report["line-number"] === "number" ? report["line-number"] : null;
  const column = typeof report["column-number"] === "number" ? report["column-number"] : null;

  return {
    documentUri: doc,
    blockedUri: blocked,
    sourceFile: source,
    violatedDirective: violated,
    effectiveDirective: effective,
    disposition,
    statusCode,
    line,
    column,
  };
}

async function readJsonWithLimit(req: Request, maxBytes = 32_000): Promise<unknown> {
  const reader = req.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > maxBytes) throw new Error("PAYLOAD_TOO_LARGE");
    chunks.push(value);
  }
  const buf = Buffer.concat(chunks.map((c) => Buffer.from(c)));
  const text = buf.toString("utf8");
  return text ? JSON.parse(text) : null;
}

export async function POST(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = (forwardedFor?.split(",")[0] || req.headers.get("x-real-ip") || "unknown").trim();
  const userAgent = (req.headers.get("user-agent") || "").slice(0, 300);

  let payload: unknown;
  try {
    payload = await readJsonWithLimit(req);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg === "PAYLOAD_TOO_LARGE") {
      return NextResponse.json({ ok: false, error: "PAYLOAD_TOO_LARGE" }, { status: 413 });
    }
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  const nowIso = new Date().toISOString();

  // Handle classic CSP reports:
  const csp = payload as CspReportPayload;
  const classic = csp?.["csp-report"];
  if (classic && typeof classic === "object") {
    const safe = pickReportFields(classic);
    try {
      const { db } = getAdmin();
      await db.collection("securityReports").add({
        type: "csp",
        timestamp: nowIso,
        ip,
        userAgent,
        ...safe,
      });
    } catch (e) {
      // Don't break responses; log for diagnostics only.
      if (process.env.NODE_ENV !== "production") {
        console.warn("CSP report log failed", e);
      }
    }
    return NextResponse.json({ ok: true });
  }

  // Handle Reporting API batches:
  if (Array.isArray(payload)) {
    const items = payload as ReportingApiItem[];
    const normalized = items
      .filter((i) => i && typeof i === "object")
      .slice(0, 20)
      .map((item) => {
        const url = toSafeUrl(item.url);
        const type = typeof item.type === "string" ? item.type.slice(0, 80) : "report";
        const body = item.body && typeof item.body === "object" ? item.body : {};
        const blockedUri = toSafeUrl((body as Record<string, unknown>)["blockedURL"] ?? (body as Record<string, unknown>)["blocked-uri"]);
        const effectiveDirective =
          typeof (body as Record<string, unknown>)["effectiveDirective"] === "string"
            ? String((body as Record<string, unknown>)["effectiveDirective"]).slice(0, 100)
            : null;
        return {
          type,
          url,
          blockedUri,
          effectiveDirective,
        };
      });

    try {
      const { db } = getAdmin();
      await db.collection("securityReports").add({
        type: "reporting-api",
        timestamp: nowIso,
        ip,
        userAgent,
        items: normalized,
      });
    } catch (e) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Reporting API log failed", e);
      }
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}

