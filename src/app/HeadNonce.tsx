"use client";
import { useEffect } from "react";

export default function HeadNonce() {
  useEffect(() => {
    const meta = document.querySelector('meta[name="csp-nonce"]');
    if (meta) return;
    const m = document.createElement("meta");
    m.setAttribute("name", "csp-nonce");
    const nonce = (window as unknown as { __CSP_NONCE?: string }).__CSP_NONCE || "";
    m.setAttribute("content", nonce);
    document.head.appendChild(m);
  }, []);
  return null;
}
