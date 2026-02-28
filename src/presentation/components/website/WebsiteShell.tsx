import NavBar from '@/presentation/components/navBar/navBar';
import FooterSection from '@/presentation/components/footerSection/footerSection';

export default function WebsiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="website-page">
      <NavBar />
      {children}
      <FooterSection />
    </div>
  );
}
