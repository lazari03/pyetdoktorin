'use client';

import HeroSection from '../../presentation/components/heroSection/heroSection';
import NavBar from '../../presentation/components/navBar/navBar';
import FooterSection from '../../presentation/components/footerSection/footerSection';
import ClinicBenefitsSection from './ClinicBenefitsSection';
import ClinicHowItWorksSection from './ClinicHowItWorksSection';
import ClinicCtaSection from './ClinicCtaSection';

export default function ClinicsPage() {
  return (
    <>
      <NavBar />
      <HeroSection/>
      <ClinicBenefitsSection />
      <ClinicHowItWorksSection />
      <ClinicCtaSection />
      <FooterSection />
    </>
  );
}
