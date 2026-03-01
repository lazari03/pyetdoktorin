'use client';
import "@/i18n/i18n";
import { useEffect } from "react";
import { AuthProvider } from "../context/AuthContext";
import { useSessionActivity } from "@/presentation/hooks/useSessionActivity";
import { useDI } from "@/context/DIContext";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  // Mount global idle/session activity tracker once on client
  function SessionActivityHost() {
    const { logoutSessionUseCase } = useDI();
    useSessionActivity(logoutSessionUseCase);
    // nothing to render
    return null;
  }

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    const win = window as Window & { __consoleFiltered?: boolean };
    if (win.__consoleFiltered) return;
    win.__consoleFiltered = true;

    const noisyPatterns = [
      /stallTrigger is deprecated/i,
      /WEBGL_debug_renderer_info is deprecated/i,
      /Partitioned cookie or storage access was provided/i,
      /Content-Security-Policy: Ignoring/i,
      /Dispatching action: SET_INTENDED_EXP/i,
      /HTTP Referrer header: Length is over/i,
      /Cookie warnings/i,
    ];

    const shouldIgnore = (args: unknown[]) => {
      const first = args[0];
      if (typeof first !== 'string') return false;
      return noisyPatterns.some((pattern) => pattern.test(first));
    };

    const wrap = <T extends (...args: unknown[]) => void>(fn: T) =>
      ((...args: unknown[]) => {
        if (shouldIgnore(args)) return;
        fn(...args);
      }) as T;

    console.log = wrap(console.log);
    console.info = wrap(console.info);
    console.warn = wrap(console.warn);
    console.error = wrap(console.error);
    console.debug = wrap(console.debug);
  }, []);

  useEffect(() => {
    // Service workers are intentionally opt-in: caching HTML in Next.js apps can cause blank screens
    // after deploys (stale HTML referencing old hashed chunks). Enable only when explicitly needed.
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const enabled = process.env.NEXT_PUBLIC_ENABLE_SERVICE_WORKER === 'true';

    if (!enabled) {
      // Migration path: if a SW was registered in older builds, unregister it to avoid stale HTML/assets.
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => {
          regs.forEach((reg) => reg.unregister().catch(() => {}));
        })
        .catch(() => {});

      if ('caches' in window) {
        caches
          .keys()
          .then((keys) => {
            keys
              .filter((key) => key.startsWith('myapp-cache-') || key.startsWith('pyetdoktorin-cache-'))
              .forEach((key) => caches.delete(key));
          })
          .catch(() => {});
      }
      return;
    }

    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  }, []);

  return (
    <AuthProvider>
      <SessionActivityHost />
      {children}
    </AuthProvider>
  );
}
