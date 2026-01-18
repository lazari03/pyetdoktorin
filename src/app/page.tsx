import HeroSection from "./components/heroSection";
import NavBar from "./components/navBar";
import ContentSection from "./components/contentSection";
import ModernCtaSection from "./components/ModernCtaSection";
import Contact from "./components/contact";
import "./styles.css"; // Ensure you import the CSS file for styling
import FooterSection from "./components/footerSection";

export default function Home() {
  return (
    <main>
      <div className="navbar-wrapper">
        <NavBar />
      </div>
      <HeroSection />
      <ContentSection />
      <ModernCtaSection />
      <Contact />
      <FooterSection />
    </main>
  );
}