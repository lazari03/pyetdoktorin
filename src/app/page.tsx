import Image from "next/image";
import HeroSection from "./components/heroSection";
import NavBar from "./components/navBar";
import ContentSection from "./components/contentSection";
import CtaSection from "./components/ctaSection";
import Contact from "./components/contact";
import "./styles.css"; // Ensure you import the CSS file for styling

export default function Home() {
  return (
    <div>
      <div className="navbar-wrapper">
        <NavBar />
      </div>
      <HeroSection />
      <ContentSection />
      <CtaSection />
      <Contact />
    </div>
  );
}