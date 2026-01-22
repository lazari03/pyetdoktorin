import HeroSection from "@/presentation/components/heroSection/heroSection";
import ModernHeroSection from "@/presentation/components/ModernHeroSection/ModernHeroSection";
import NavBar from "@/presentation/components/navBar/navBar";
import ContentSection from "@/presentation/components/contentSection/contentSection";
import ModernCtaSection from "@/presentation/components/ModernCtaSection/ModernCtaSection";
import "./styles.css";
import FooterSection from "@/presentation/components/footerSection/footerSection";

export default function Home() {
  return (
    <main>
      <div className="navbar-wrapper">
        <NavBar />
      </div>
      <HeroSection />
      <ContentSection />
      <ModernCtaSection />
      <ModernHeroSection />
      <FooterSection />

    </main>
  );
}