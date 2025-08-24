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
        backgroundImage="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
        locale="en"
      />
  <IndividualBenefitsSection />
  <IndividualHowItWorksSection />
  <IndividualCtaSection />
      <FooterSection />
    </>
  );
}
