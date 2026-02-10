"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";


// Declare gtag on the window object for TypeScript
declare global {
  interface Window {
    gtag?: (command: 'config' | 'event', targetId: string, params?: Record<string, unknown>) => void;
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID || '';

const getSafeText = (value?: string | null) => {
  if (!value) return "";
  return value.replace(/\s+/g, " ").trim().slice(0, 80);
};

const isElementDisabled = (el: Element) => {
  if (el instanceof HTMLButtonElement) return el.disabled;
  const ariaDisabled = el.getAttribute("aria-disabled");
  return ariaDisabled === "true";
};

const getHrefPath = (href: string | null) => {
  if (!href) return "";
  try {
    const url = new URL(href, window.location.origin);
    return url.pathname;
  } catch {
    return href;
  }
};

const getFormIdentifier = (form: HTMLFormElement | null) => {
  if (!form) return "";
  return form.getAttribute("id") || form.getAttribute("name") || "";
};

const getInputIdentifier = (input: HTMLInputElement | HTMLSelectElement | null) => {
  if (!input) return "";
  return input.getAttribute("id") || input.getAttribute("name") || "";
};

export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, role } = useAuth();
  const lastStateRef = useRef<string | null>(null);

  const pagePath = useMemo(
    () => pathname + (searchParams ? `?${searchParams}` : ""),
    [pathname, searchParams]
  );

  useEffect(() => {
    if (typeof window.gtag === "function") {
      window.gtag("config", GA_ID, {
        page_path: pagePath,
      });
    }
  }, [pagePath]);

  useEffect(() => {
    if (typeof window.gtag !== "function" || !GA_ID) return;
    const statePayload = {
      page_path: pagePath,
      is_authenticated: Boolean(isAuthenticated),
      role: role || "unknown",
    };
    const stateKey = JSON.stringify(statePayload);
    if (lastStateRef.current === stateKey) return;
    lastStateRef.current = stateKey;
    window.gtag("event", "ui_state", statePayload);
  }, [pagePath, isAuthenticated, role]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleClick = (event: MouseEvent) => {
      if (typeof window.gtag !== "function" || !GA_ID) return;
      const target = event.target as Element | null;
      if (!target) return;
      const element = target.closest("button, a, [role='button']") as Element | null;
      if (!element || isElementDisabled(element)) return;

      const label =
        element.getAttribute("data-analytics") ||
        element.getAttribute("aria-label") ||
        getSafeText(element.textContent);
      const href = element instanceof HTMLAnchorElement ? getHrefPath(element.getAttribute("href")) : "";
      const payload = {
        page_path: pagePath,
        element_type: element.tagName.toLowerCase(),
        element_id: element.getAttribute("id") || "",
        element_label: label,
        element_href: href,
        role: role || "unknown",
      };
      window.gtag("event", "ui_click", payload);
    };

    window.addEventListener("click", handleClick, { capture: true });
    return () => window.removeEventListener("click", handleClick, { capture: true });
  }, [pagePath, role]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleSubmit = (event: Event) => {
      if (typeof window.gtag !== "function" || !GA_ID) return;
      const target = event.target as HTMLFormElement | null;
      if (!target) return;
      const payload = {
        page_path: pagePath,
        form_id: getFormIdentifier(target),
        role: role || "unknown",
      };
      window.gtag("event", "ui_submit", payload);
    };

    window.addEventListener("submit", handleSubmit, { capture: true });
    return () => window.removeEventListener("submit", handleSubmit, { capture: true });
  }, [pagePath, role]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleChange = (event: Event) => {
      if (typeof window.gtag !== "function" || !GA_ID) return;
      const target = event.target as HTMLInputElement | HTMLSelectElement | null;
      if (!target) return;
      const tag = target.tagName.toLowerCase();
      if (tag === "input") {
        const type = (target as HTMLInputElement).type;
        if (!["checkbox", "radio"].includes(type)) return;
      } else if (tag !== "select") {
        return;
      }
      const payload = {
        page_path: pagePath,
        element_type: tag,
        element_id: getInputIdentifier(target),
        role: role || "unknown",
        toggled: tag === "input" ? (target as HTMLInputElement).checked : undefined,
        selected_index: tag === "select" ? (target as HTMLSelectElement).selectedIndex : undefined,
      };
      window.gtag("event", "ui_change", payload);
    };

    window.addEventListener("change", handleChange, { capture: true });
    return () => window.removeEventListener("change", handleChange, { capture: true });
  }, [pagePath, role]);

  return null;
}
