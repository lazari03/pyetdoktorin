"use client";

import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useTranslation } from "react-i18next";
import { useState } from "react";

// Dummy images (replace with your own assets)
const MAIN_IMAGE = "/img/portrait-demo.jpg";
const PREVIEW_IMAGE = "/img/doctor-demo.jpg";


export default function HeroSection() {
  const nav = useNavigationCoordinator();
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(false);

  return (
    <section
      className="relative w-full min-h-[90vh] flex items-center justify-center px-2 py-8 bg-violet-900 hero-bg rounded-t-3xl overflow-hidden"
    >
      {/* Glassmorphism overlay for extra effect - now before content */}
      <div className="pointer-events-none absolute inset-0 rounded-t-3xl bg-violet-900/90 hero-bg-overlay overflow-hidden" />
      <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-12 md:gap-0 relative">
        {/* Left Column */}
        <div className="flex-1 flex flex-col items-start justify-center px-2 md:px-8">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            The world's most loved{" "}
            <span className="inline-block px-6 py-2 bg-white/10 border-2 border-violet-300 rounded-full text-violet-100 backdrop-blur-md shadow-lg transition-all duration-300">
              telemedicine
            </span>{" "}
            solution
          </h1>
          <p className="text-lg sm:text-2xl font-light text-violet-100/80 mb-8 max-w-xl">
            Experience why more than 1 million providers trust us already.
          </p>
          <div className="flex gap-4 mt-2">
            <button
              className={`px-8 py-3 rounded-full font-semibold text-lg bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2
                ${hovered ? "scale-105" : ""}
              `}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              onClick={() => nav.toRegister()}
            >
              Get started for free
            </button>
            <button
              className="px-8 py-3 rounded-full font-semibold text-lg border-2 border-violet-300 text-violet-100 bg-white/5 hover:bg-violet-800/30 transition-all duration-300 shadow focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2"
              onClick={() => nav.pushPath('/clinics')}
            >
              Explore Clinic solutions
            </button>
          </div>
        </div>
        {/* Right Column */}
        <div className="flex-1 flex items-center justify-center w-full md:w-auto">
          <div className="relative w-[340px] sm:w-[400px] aspect-[3/4] bg-white/10 rounded-2xl md:rounded-3xl shadow-2xl border border-white/20 backdrop-blur-xl flex items-center justify-center overflow-visible">
            {/* Main portrait image */}
            <img
              src={MAIN_IMAGE}
              alt="Video call main"
              className="w-full h-full object-cover rounded-2xl md:rounded-3xl"
              draggable={false}
            />
            {/* Floating video preview */}
            <div className="absolute top-4 right-4 w-24 h-20 sm:w-28 sm:h-24 bg-white/30 border border-white/40 rounded-xl shadow-lg overflow-hidden flex items-center justify-center backdrop-blur-md">
              <img
                src={PREVIEW_IMAGE}
                alt="Video preview"
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
            {/* Bottom control bar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 bg-white/30 rounded-xl px-4 py-2 shadow-lg backdrop-blur-md border border-white/40">
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full bg-violet-500 text-white hover:bg-violet-600 transition"
                aria-label="Microphone"
              >
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 1v14m0 0a5 5 0 0 0 5-5V6a5 5 0 0 0-10 0v4a5 5 0 0 0 5 5zm0 0v4m-7 0h14"/></svg>
              </button>
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full bg-violet-500 text-white hover:bg-violet-600 transition"
                aria-label="Camera"
              >
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="10" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v2"/></svg>
              </button>
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition"
                aria-label="End call"
              >
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><path d="M15 10V5a3 3 0 0 0-6 0v5"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
  {/* ...overlay moved above... */}
    </section>
  );
}