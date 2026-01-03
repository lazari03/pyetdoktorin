'use client';

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
        backgroundImage="https://portokalle-storage.fra1.digitaloceanspaces.com/img/pexels-karolina-grabowska-7195310.jpg"
      />
      <ClinicBenefitsSection />
      <ClinicHowItWorksSection />
      <ClinicCtaSection />
      <FooterSection />
    </>
  );
}
