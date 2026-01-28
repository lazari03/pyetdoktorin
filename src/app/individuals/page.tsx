'use client';

import HeroSection from '../../presentation/components/heroSection/heroSection';
import NavBar from '../../presentation/components/navBar/navBar';


import IndividualBenefitsSection from './IndividualBenefitsSection';
import IndividualHowItWorksSection from './IndividualHowItWorksSection';
import IndividualCtaSection from './IndividualCtaSection';
import FooterSection from '../../presentation/components/footerSection/footerSection';

export default function IndividualsPage() {
  return (
    <>
      <NavBar />
      <HeroSection/>
  <IndividualBenefitsSection />
  <IndividualHowItWorksSection />
  <IndividualCtaSection />
      <FooterSection />
    </>
  );
}
