"use client";

import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useTranslation } from "react-i18next";
import { useState } from "react";


type HeroSectionProps = {
  backgroundImage?: string;
};

export default function HeroSection({
  backgroundImage = "https://portokalle-storage.fra1.digitaloceanspaces.com/img/pexels-karolina-grabowska-7195123.jpg",
}: HeroSectionProps) {
  const nav = useNavigationCoordinator();
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(false);

  return (
    <section
      className="relative min-h-[80vh] flex items-center justify-center bg-cover bg-center z-0 transition-all duration-500 overflow-hidden"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
  <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent -z-10" />

      <div className="relative w-full px-4 py-20 sm:py-32 flex flex-col items-center text-white text-center z-20">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6 animate-fade-in">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight drop-shadow-lg text-orange-300">
            {t('heroTitle')}
          </h1>
          <p className="text-lg sm:text-2xl font-medium text-white/90 drop-shadow">
            {t('heroDescription')}
          </p>
          <button
            className={`mt-4 px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2
              ${hovered ? "bg-orange-700 scale-105" : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"}
            `}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => nav.toRegister()}
          >
            {t('getStarted')}
          </button>
        </div>
      </div>
    </section>
  );
}
