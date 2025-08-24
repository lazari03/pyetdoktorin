"use client";

import React from "react";
import Link from "next/link";
import FooterSection from "../components/footerSection";
import NavBar from "../components/navBar";

export default function JobsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <NavBar />
      <section className="relative w-full bg-gradient-to-b from-orange-500 to-orange-100 pb-20 pt-16 md:pt-24 text-black overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center pt-10 md:pt-20">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Jobs</h1>
          <p className="text-lg md:text-xl mb-2 text-gray-700 text-center max-w-2xl">Join the Portokalle team and help shape the future of digital healthcare.</p>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
            <span className="hover:underline cursor-pointer"><Link href="/">Home</Link></span>
            <span>/</span>
            <span className="font-semibold text-orange-500">Jobs</span>
          </div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full" height="60" viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="#fff" d="M0,0 C480,60 960,0 1440,60 L1440,60 L0,60 Z"/></svg>
      </section>
      <main className="flex-1 flex flex-col items-center justify-center px-2 py-8 bg-white">
        <div className="max-w-3xl w-full flex flex-col gap-10 animate-fade-in">
          <section className="bg-white rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Jobs will be posted here</h2>
            <p className="text-gray-700">At the moment we don&apos;t have a vacant position. Please come back later.</p>
          </section>
        </div>
      </main>
      <FooterSection />
    </div>
  );
}
