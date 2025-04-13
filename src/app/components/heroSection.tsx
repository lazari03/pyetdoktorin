"use client";

import { useRouter } from "next/navigation";

type HeroSectionProps = {
  title?: string;
  description?: string;
  backgroundImage?: string;
  buttonText?: string;
};

export default function HeroSection({
  title = "Your Health, One Click Away",
  description = "Connect with licensed doctors from the comfort of your home. Schedule consultations, receive prescriptions, and access medical care—anytime, anywhere.",
  backgroundImage = "https://portokalle-storage.fra1.digitaloceanspaces.com/img/pexels-karolina-grabowska-7195123.jpg",
  buttonText = "Get Started",
}: HeroSectionProps) {
  const router = useRouter();

  return (
    <div
      className="relative min-h-screen pt-16 flex items-end bg-cover bg-center z-0"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Shadow fade at the bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent -z-10" />

      {/* Content */}
      <div className="relative w-full px-4 py-24 text-white text-center">
        <div className="max-w-xl mx-auto">
          <h1 className="mb-5 text-5xl text-white font-bold">{title}</h1>
          <p className="mb-5 text-lg">{description}</p>
          <button
            className="bg-[#ea580c] hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-full transition-colors"
            onClick={() => router.push("/register")}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
