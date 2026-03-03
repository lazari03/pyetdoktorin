import '../styles.css';
import WebsiteProviders from './WebsiteProviders';
import CookieConsentBannerGate from '@/presentation/components/CookieConsentBanner/CookieConsentBannerGate';

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CookieConsentBannerGate />
      <WebsiteProviders>{children}</WebsiteProviders>
    </>
  );
}
