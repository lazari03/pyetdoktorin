"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  getAnalyticsConsent,
  getPersistedAnalyticsConsent,
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

  useEffect(() => subscribeAnalyticsConsent(setConsent), []);

  if (dismissed || consent !== "unset") return null;

  return (
    <div className={`fixed bottom-4 left-4 right-4 ${z.notification}`}>
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white/95 backdrop-blur px-4 py-4 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              {t("cookieBannerTitle", "Cookies & analytics")}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {t(
                "cookieBannerBody",
                "We use optional analytics cookies to understand usage and improve the product. You can accept or decline."
              )}{" "}
              <Link href={ROUTES.PRIVACY} className="text-purple-700 hover:underline">
                {t("privacyPolicy", "Privacy policy")}
              </Link>
            </p>
            {saveFailed ? (
              <p className="text-xs text-red-600 mt-2">
                {t(
                  "cookieBannerSaveFailed",
                  "We couldn’t save your preference. Please enable cookies/storage for this site and try again."
                )}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={async () => {
                setSaveFailed(false);
                try {
                  setAnalyticsConsent("denied");
                } catch {}
                let persisted = getPersistedAnalyticsConsent();

                if (persisted === "unset") {
                  try {
                    await fetch("/api/consent", {
                      method: "POST",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify({ analytics: "denied" }),
                    });
                  } catch {}
                  persisted = getPersistedAnalyticsConsent();
                }

                if (persisted === "unset") return setSaveFailed(true);

                setConsent("denied");
                return setDismissed(true);
              }}
              data-analytics="consent.analytics.reject"
            >
              {t("rejectAnalytics", "Reject")}
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={async () => {
                setSaveFailed(false);
                try {
                  setAnalyticsConsent("granted");
                } catch {}
                let persisted = getPersistedAnalyticsConsent();

                if (persisted === "unset") {
                  try {
                    await fetch("/api/consent", {
                      method: "POST",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify({ analytics: "granted" }),
                    });
                  } catch {}
                  persisted = getPersistedAnalyticsConsent();
                }

                if (persisted === "unset") return setSaveFailed(true);

                setConsent("granted");
                return setDismissed(true);
              }}
              data-analytics="consent.analytics.accept"
            >
              {t("acceptAnalytics", "Accept")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
