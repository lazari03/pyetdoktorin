import AppProviders from './AppProviders';
import CookieConsentBannerGate from '@/presentation/components/CookieConsentBanner/CookieConsentBannerGate';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CookieConsentBannerGate />
      <AppProviders>{children}</AppProviders>
    </>
  );
}
