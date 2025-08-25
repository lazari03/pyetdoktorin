import HeroSection from '../components/heroSection';
import NavBar from '../components/navBar';


import IndividualBenefitsSection from './IndividualBenefitsSection';
import IndividualHowItWorksSection from './IndividualHowItWorksSection';
import IndividualCtaSection from './IndividualCtaSection';
import FooterSection from '../components/footerSection';

export default function IndividualsPage() {
  return (
    <>
      <NavBar />
      <HeroSection 
        backgroundImage="https://portokalle-storage.fra1.digitaloceanspaces.com/img/pexels-shvetsa-4225920.jpg"
        locale="en"
      />
  <IndividualBenefitsSection />
  <IndividualHowItWorksSection />
  <IndividualCtaSection />
      <FooterSection />
    </>
  );
}
