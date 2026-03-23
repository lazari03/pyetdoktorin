import { cookies } from "next/headers";
import { ANALYTICS_CONSENT_COOKIE_NAME } from "@/config/cookies";
import CookieConsentBanner from "@/presentation/components/CookieConsentBanner/CookieConsentBanner";
import { getRequestLocale, getServerTranslations } from "@/i18n/serverTranslations";

export default async function CookieConsentBannerGate() {
  const value = (await cookies()).get(ANALYTICS_CONSENT_COOKIE_NAME)?.value;
  if (value === "granted" || value === "denied") return null;
  const locale = await getRequestLocale();
  const t = await getServerTranslations(locale);
  return (
    <CookieConsentBanner
      title={t("cookieBannerTitle")}
      body={t("cookieBannerBody")}
      privacyPolicyLabel={t("privacyPolicy")}
      saveFailedMessage={t("cookieBannerSaveFailed")}
      rejectLabel={t("rejectAnalytics")}
      acceptLabel={t("acceptAnalytics")}
      savingLabel={t("saving")}
    />
  );
}
