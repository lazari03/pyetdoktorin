"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import {
  getAnalyticsConsent,
  getAnalyticsConsentCookie,
  setAnalyticsConsent,
  subscribeAnalyticsConsent,
} from "@/presentation/utils/analyticsConsent";
import { ROUTES } from "@/config/routes";
import { z } from "@/config/zIndex";

type CookieConsentBannerProps = {
  title: string;
  body: string;
  privacyPolicyLabel: string;
  saveFailedMessage: string;
  rejectLabel: string;
  acceptLabel: string;
  savingLabel: string;
};

export default function CookieConsentBanner({
  title,
  body,
  privacyPolicyLabel,
  saveFailedMessage,
  rejectLabel,
  acceptLabel,
  savingLabel,
}: CookieConsentBannerProps) {
  const [consent, setConsent] = useState(() => getAnalyticsConsent());
  const [dismissed, setDismissed] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeAnalyticsConsent(setConsent), []);

  if (dismissed || consent !== "unset") return null;

  return (
    <div className={`fixed inset-x-0 bottom-0 ${z.notification} px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4`}>
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-2xl ring-1 ring-black/5">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <ShieldCheckIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {body}{" "}
                <Link href={ROUTES.PRIVACY} className="font-semibold text-purple-700 hover:underline">
                  {privacyPolicyLabel}
                </Link>
              </p>
              {saveFailed ? (
                <p className="mt-2 text-xs font-medium text-red-600">
                  {saveFailedMessage}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:shrink-0">
            <button
              type="button"
              className="btn btn-ghost btn-sm border border-slate-200 bg-white/70 hover:bg-white"
              disabled={saving}
              onClick={async () => {
                setSaveFailed(false);
                setSaving(true);
                try {
                  setAnalyticsConsent("denied");
                } catch {}
                // Enterprise requirement: the choice must persist in a cookie (SSR-visible).
                let cookie = getAnalyticsConsentCookie();

                if (cookie === "unset") {
                  try {
                    await fetch("/api/consent", {
                      method: "POST",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify({ analytics: "denied" }),
                    });
                  } catch {}
                  cookie = getAnalyticsConsentCookie();
                }

                if (cookie === "unset") {
                  setSaveFailed(true);
                  setSaving(false);
                  return;
                }

                setConsent("denied");
                setDismissed(true);
                setSaving(false);
              }}
              data-analytics="consent.analytics.reject"
            >
              {saving ? savingLabel : rejectLabel}
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={saving}
              onClick={async () => {
                setSaveFailed(false);
                setSaving(true);
                try {
                  setAnalyticsConsent("granted");
                } catch {}
                let cookie = getAnalyticsConsentCookie();

                if (cookie === "unset") {
                  try {
                    await fetch("/api/consent", {
                      method: "POST",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify({ analytics: "granted" }),
                    });
                  } catch {}
                  cookie = getAnalyticsConsentCookie();
                }

                if (cookie === "unset") {
                  setSaveFailed(true);
                  setSaving(false);
                  return;
                }

                setConsent("granted");
                setDismissed(true);
                setSaving(false);
              }}
              data-analytics="consent.analytics.accept"
            >
              {saving ? savingLabel : acceptLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
