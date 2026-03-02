import '../styles.css';
import WebsiteProviders from './WebsiteProviders';

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return <WebsiteProviders>{children}</WebsiteProviders>;
}

