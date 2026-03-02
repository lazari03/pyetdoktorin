import NavBarServer from '@/presentation/components/navBar/NavBarServer';
import FooterSection from '@/presentation/components/footerSection/footerSection';

export default function WebsiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="website-page">
      <NavBarServer />
      {children}
      <FooterSection />
    </div>
  );
}
