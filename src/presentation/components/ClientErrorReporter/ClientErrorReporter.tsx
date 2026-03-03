"use client";

import { useEffect } from "react";
import { reportClientError } from "@/presentation/utils/errorReporting";

function signature(message: string | undefined, stack: string | undefined): string {
  return `${message ?? ""}::${stack ?? ""}`.slice(0, 4000);
}

export default function ClientErrorReporter() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (process.env.NODE_ENV !== "production") return;

    const recentlyReported = new Map<string, number>();
    const ttlMs = 60_000;

    const shouldReport = (msg?: string, stack?: string) => {
      const key = signature(msg, stack);
      const now = Date.now();
      const last = recentlyReported.get(key);
      if (last && now - last < ttlMs) return false;
      recentlyReported.set(key, now);
      return true;
    };

    const onError = (event: ErrorEvent) => {
      const message = event.message || "Unhandled window error";
      const stack = event.error instanceof Error ? event.error.stack : undefined;
      if (!shouldReport(message, stack)) return;
      reportClientError({ type: "window_error", error: event.error ?? message });
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = reason instanceof Error ? reason.message : typeof reason === "string" ? reason : "Unhandled rejection";
      const stack = reason instanceof Error ? reason.stack : undefined;
      if (!shouldReport(message, stack)) return;
      reportClientError({ type: "unhandledrejection", error: reason ?? message });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}

