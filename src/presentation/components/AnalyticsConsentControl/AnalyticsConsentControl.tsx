"use client";

import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AnalyticsConsentValue,
  getAnalyticsConsent,
  setAnalyticsConsent,
  subscribeAnalyticsConsent,
} from "@/presentation/utils/analyticsConsent";

function consentLabel(consent: AnalyticsConsentValue, t: (key: string, options?: { defaultValue?: string }) => string) {
  if (consent === "granted") return t("analyticsEnabled", { defaultValue: "Enabled" });
  if (consent === "denied") return t("analyticsDisabled", { defaultValue: "Disabled" });
  return t("analyticsUnset", { defaultValue: "Not set" });
}

export default function AnalyticsConsentControl() {
  const { t } = useTranslation();
  const id = useId();
  const [consent, setConsent] = useState<AnalyticsConsentValue>(() => getAnalyticsConsent());

  useEffect(() => subscribeAnalyticsConsent(setConsent), []);

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <label htmlFor={id} className="block text-xs font-semibold text-slate-700">
            {t("analyticsPreferenceTitle", { defaultValue: "Analytics" })}
          </label>
          <p className="mt-1 text-xs text-slate-600">
            {t(
              "analyticsPreferenceCopy",
              { defaultValue: "Allow optional analytics cookies to help us understand usage and improve the product." }
            )}
          </p>
        </div>
        <div className="shrink-0 text-[11px] font-semibold text-slate-600 rounded-full bg-slate-100 px-2 py-1">
          {consentLabel(consent, t)}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          id={id}
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setAnalyticsConsent("denied")}
          disabled={consent === "denied"}
          data-analytics="settings.analytics.reject"
        >
          {t("rejectAnalytics", { defaultValue: "Reject" })}
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setAnalyticsConsent("granted")}
          disabled={consent === "granted"}
          data-analytics="settings.analytics.accept"
        >
          {t("acceptAnalytics", { defaultValue: "Accept" })}
        </button>
      </div>
    </div>
  );
}
