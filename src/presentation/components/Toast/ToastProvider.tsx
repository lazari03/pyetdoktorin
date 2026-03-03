"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { z } from "@/config/zIndex";

export type ToastVariant = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  message: string;
  title?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastContextValue = {
  toast: (item: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
  clear: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function randomId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function variantClasses(variant: ToastVariant) {
  switch (variant) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "error":
      return "border-red-200 bg-red-50 text-red-900";
    default:
      return "border-slate-200 bg-white text-slate-900";
  }
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clear = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current.clear();
    setItems([]);
  }, []);

  const toast = useCallback(
    (item: Omit<ToastItem, "id">) => {
      const id = randomId();
      const durationMs = item.durationMs ?? 4500;
      const next: ToastItem = {
        id,
        variant: item.variant ?? "info",
        message: item.message,
        title: item.title,
        durationMs,
      };

      setItems((prev) => [next, ...prev].slice(0, 4));

      if (typeof window !== "undefined") {
        const timer = window.setTimeout(() => dismiss(id), durationMs);
        timersRef.current.set(id, timer);
      }
    },
    [dismiss]
  );

  useEffect(() => () => clear(), [clear]);

  const value = useMemo<ToastContextValue>(() => ({ toast, dismiss, clear }), [toast, dismiss, clear]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className={`fixed bottom-4 right-4 ${z.toast} flex w-[min(92vw,380px)] flex-col gap-2`}
        aria-live="polite"
        aria-relevant="additions removals"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className={`rounded-2xl border px-4 py-3 shadow-lg backdrop-blur ${variantClasses(t.variant ?? "info")}`}
            role={t.variant === "error" ? "alert" : "status"}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {t.title && <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{t.title}</p>}
                <p className="text-sm font-semibold">{t.message}</p>
              </div>
              <button
                className="text-xs font-semibold opacity-70 hover:opacity-100"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
