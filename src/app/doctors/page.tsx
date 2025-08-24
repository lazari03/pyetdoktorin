import HeroSection from '../components/heroSection';
import NavBar from '../components/navBar';
import FooterSection from '../components/footerSection';
import DoctorStatsSection from './DoctorStatsSection';
import DoctorFeaturesSection from './DoctorFeaturesSection';
import DoctorHowItWorksSection from './DoctorHowItWorksSection';

export default function DoctorsPage() {
  return (
    <>
      <NavBar />
      <HeroSection 
        backgroundImage="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1200&q=80"
        locale="en"
      />
      <main className="max-w-5xl mx-auto px-4 py-12">
        <DoctorStatsSection />
        <DoctorFeaturesSection />
        <DoctorHowItWorksSection />
      </main>
      <FooterSection />
    </>
  );
}
