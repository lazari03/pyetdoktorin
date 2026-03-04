"use client";

import "@/i18n/i18n";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import {
  getAnalyticsConsent,
  getAnalyticsConsentCookie,
  setAnalyticsConsent,
  subscribeAnalyticsConsent,
} from "@/presentation/utils/analyticsConsent";
import { ROUTES } from "@/config/routes";
import { z } from "@/config/zIndex";

export default function CookieConsentBanner() {
  const { t } = useTranslation();
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
              <p className="text-sm font-semibold text-slate-900">
                {t("cookieBannerTitle", "Cookies & analytics")}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {t(
                  "cookieBannerBody",
                  "We use optional analytics cookies to understand usage and improve the product. You can accept or decline."
                )}{" "}
                <Link href={ROUTES.PRIVACY} className="font-semibold text-purple-700 hover:underline">
                  {t("privacyPolicy", "Privacy policy")}
                </Link>
              </p>
              {saveFailed ? (
                <p className="mt-2 text-xs font-medium text-red-600">
                  {t(
                    "cookieBannerSaveFailed",
                    "We couldn’t save your preference. Please enable cookies/storage for this site and try again."
                  )}
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
              {t("rejectAnalytics", "Reject")}
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
              {saving ? t("saving", "Saving…") : t("acceptAnalytics", "Accept")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
