'use client';

import HeroSection from '../../presentation/components/heroSection/heroSection';
import NavBar from '../../presentation/components/navBar/navBar';
import FooterSection from '../../presentation/components/footerSection/footerSection';
import DoctorStatsSection from './DoctorStatsSection';
import DoctorFeaturesSection from './DoctorFeaturesSection';
import DoctorHowItWorksSection from './DoctorHowItWorksSection';

export default function DoctorsPage() {
  return (
    <>
      <NavBar />
      <HeroSection/>
      <main className="max-w-5xl mx-auto px-4 py-12">
        <DoctorStatsSection />
        <DoctorFeaturesSection />
        <DoctorHowItWorksSection />
      </main>
      <FooterSection />
    </>
  );
}
