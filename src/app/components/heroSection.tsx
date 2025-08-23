"use client";

import { useRouter } from "next/navigation";
import heroSectionStrings from "./heroSection.strings";
import { useState } from "react";


type HeroSectionProps = {
  locale?: keyof typeof heroSectionStrings;
  backgroundImage?: string;
};

export default function HeroSection({
  locale = "en",
  backgroundImage = "https://portokalle-storage.fra1.digitaloceanspaces.com/img/pexels-karolina-grabowska-7195123.jpg",
}: HeroSectionProps) {
  const router = useRouter();
  const strings = heroSectionStrings[locale] || heroSectionStrings.en;
  const [hovered, setHovered] = useState(false);

  return (
    <section
      className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 bg-cover bg-center z-0 transition-all duration-500 overflow-hidden"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Decorative circles for unified background */}
  {/* Decorative orange circle: top half, aligns with bottom half in next section */}
  <div className="absolute bottom-0 -left-32 w-96 h-48 bg-orange-100 rounded-t-full opacity-30 z-0" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-200 rounded-full opacity-30 z-0" />
      {/* Overlay gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent -z-10" />
      {/* Bottom fade for seamless transition */}
      <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-orange-100 z-10" />

      {/* Content */}
      <div className="relative w-full px-4 py-20 sm:py-32 flex flex-col items-center text-white text-center z-20">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6 animate-fade-in">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight drop-shadow-lg">
            {strings.title}
          </h1>
          <p className="text-lg sm:text-2xl font-medium text-white/90 drop-shadow">
            {strings.description}
          </p>
          <button
            className={`mt-4 px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2
              ${hovered ? "bg-orange-700 scale-105" : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"}
            `}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => router.push("/register")}
          >
            {strings.buttonText}
          </button>
        </div>
      </div>
    </section>
  );
}
