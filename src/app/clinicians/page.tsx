
import HeroSection from '../components/heroSection';
import NavBar from '../components/navBar';
import FooterSection from '../components/footerSection';
import ClinicBenefitsSection from './ClinicBenefitsSection';
import ClinicHowItWorksSection from './ClinicHowItWorksSection';
import ClinicCtaSection from './ClinicCtaSection';

export default function ClinicsPage() {
  return (
    <>
      <NavBar />
      <HeroSection 
        backgroundImage="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd07?auto=format&fit=crop&w=1200&q=80"
        locale="en"
      />
      <ClinicBenefitsSection />
      <ClinicHowItWorksSection />
      <ClinicCtaSection />
      <FooterSection />
    </>
  );
}
