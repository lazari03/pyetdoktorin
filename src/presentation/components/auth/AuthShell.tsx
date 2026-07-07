import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

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
  maxWidthClassName?: string;
};

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  highlights = [],
  rightCta,
  maxWidthClassName = "max-w-md",
}: Props) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className={`w-full ${maxWidthClassName}`}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-7">
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[.13em] text-purple-600">{eyebrow}</p>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{title}</h1>
            <p className="text-[12.5px] text-gray-500 mt-1">{subtitle}</p>
          </div>
          <div className="flex flex-col gap-3">{children}</div>
        </div>

        {rightCta && (
          <div className="mt-3 rounded-2xl border border-purple-100 bg-purple-50/60 px-5 py-3.5">
            {rightCta}
          </div>
        )}

        {highlights.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
            {highlights.map((h, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500">
                <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                {h.title}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
