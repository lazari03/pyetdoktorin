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
        backgroundImage="https://portokalle-storage.fra1.digitaloceanspaces.com/img/pexels-karolina-grabowska-4021779.jpg"
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
