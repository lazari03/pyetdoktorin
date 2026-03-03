export type ClientErrorReportType = "react_error_boundary" | "window_error" | "unhandledrejection";

export type ClientErrorReport = {
  id: string;
  requestId?: string;
  type: ClientErrorReportType;
  message: string;
  stack?: string;
  digest?: string;
  path?: string;
  userAgent?: string;
  timestamp: string;
};

function safeString(value: unknown, maxLen: number): string | undefined {
  if (typeof value !== "string") return undefined;
  if (value.length <= maxLen) return value;
  return value.slice(0, maxLen);
}

export function serializeUnknownError(error: unknown): { message: string; stack?: string } {
  if (error instanceof Error) {
    return {
      message: error.message || String(error),
      stack: error.stack,
    };
  }
  if (typeof error === "string") return { message: error };
  try {
    return { message: JSON.stringify(error) };
  } catch {
    return { message: String(error) };
  }
}

function randomId(): string {
  try {
    if (typeof globalThis !== "undefined" && "crypto" in globalThis) {
      const c = globalThis.crypto;
      if (typeof c?.randomUUID === "function") return c.randomUUID();
    }
  } catch {
    // ignore
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function sendClientErrorReport(report: ClientErrorReport): Promise<void> {
  try {
    await fetch("/api/client-error", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(report.requestId ? { "x-request-id": report.requestId } : {}),
      },
      body: JSON.stringify(report),
      keepalive: true,
    });
  } catch {
    // ignore
  }
}

export function reportClientError(input: {
  type: ClientErrorReportType;
  error: unknown;
  digest?: string;
  id?: string;
}): string {
  if (typeof window === "undefined") return "";

  const { message, stack } = serializeUnknownError(input.error);
  const id = input.id ?? randomId();
  const requestId =
    document.querySelector('meta[name="request-id"]')?.getAttribute("content") || undefined;

  const report: ClientErrorReport = {
    id,
    requestId: safeString(requestId, 200),
    type: input.type,
    message: safeString(message, 2000) ?? "Unknown error",
    stack: safeString(stack, 20000),
    digest: safeString(input.digest, 200),
    path: safeString(window.location.pathname, 500),
    userAgent: safeString(navigator.userAgent, 500),
    timestamp: new Date().toISOString(),
  };

  // Don't spam the endpoint in development.
  if (process.env.NODE_ENV === "production") {
    void sendClientErrorReport(report);
  } else {
    console.error("[client-error]", report);
  }

  return id;
}
