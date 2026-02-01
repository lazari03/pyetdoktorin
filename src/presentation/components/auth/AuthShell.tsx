import React from "react";

type Highlight = {
  title: string;
  body: string;
};

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  highlights?: Highlight[];
  rightCta?: React.ReactNode;
};

export function AuthShell({ eyebrow, title, subtitle, children, highlights = [], rightCta }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl bg-white/90 backdrop-blur rounded-3xl shadow-xl border border-purple-50 overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-3/5 p-6 sm:p-8 flex flex-col gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-purple-600 font-semibold">{eyebrow}</p>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
          {children}
        </div>

        <div className="hidden md:flex w-2/5 flex-col justify-between bg-purple-600 text-white px-7 py-8 gap-4">
          <div className="space-y-3">
            {highlights.map((h, idx) => (
              <div key={idx} className="rounded-2xl border border-white/20 bg-white/10 px-3 py-3">
                <p className="text-sm font-semibold">{h.title}</p>
                <p className="text-xs text-white/80">{h.body}</p>
              </div>
            ))}
          </div>
          {rightCta}
        </div>
      </div>
    </div>
  );
}
