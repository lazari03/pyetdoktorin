import { cookies } from "next/headers";
import { ANALYTICS_CONSENT_COOKIE_NAME } from "@/config/cookies";
import CookieConsentBanner from "@/presentation/components/CookieConsentBanner/CookieConsentBanner";

export default async function CookieConsentBannerGate() {
  const value = (await cookies()).get(ANALYTICS_CONSENT_COOKIE_NAME)?.value;
  if (value === "granted" || value === "denied") return null;
  return <CookieConsentBanner />;
}

