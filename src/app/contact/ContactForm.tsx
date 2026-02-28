"use client";

import React, { useRef } from "react";

type ContactFormProps = {
  namePlaceholder: string;
  emailPlaceholder: string;
  messagePlaceholder: string;
  submitLabel: string;
  successMessage: string;
  errorMessage: string;
};

export default function ContactForm({
  namePlaceholder,
  emailPlaceholder,
  messagePlaceholder,
  submitLabel,
  successMessage,
  errorMessage,
}: ContactFormProps) {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameRef.current?.value || "";
    const email = emailRef.current?.value || "";
    const message = messageRef.current?.value || "";
    const res = await fetch("/api/contact/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message, source: "contact_page" }),
    });
    const data = await res.json();
    if (res.ok) {
      alert(successMessage);
    } else {
      alert(data.message || errorMessage);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleContactSubmit}>
      <input
        ref={nameRef}
        type="text"
        placeholder={namePlaceholder}
        className="rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
        required
      />
      <input
        ref={emailRef}
        type="email"
        placeholder={emailPlaceholder}
        className="rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
        required
      />
      <textarea
        ref={messageRef}
        placeholder={messagePlaceholder}
        className="rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
        rows={4}
        required
      />
      <button
        type="submit"
        className="rounded-full bg-purple-600 text-white font-semibold py-3 px-6 hover:bg-purple-500 transition"
      >
        {submitLabel}
      </button>
    </form>
  );
}
