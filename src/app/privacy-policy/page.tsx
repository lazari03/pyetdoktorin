"use client";

import React from "react";
import Link from "next/link";
import FooterSection from "../components/footerSection";
import NavBar from "../components/navBar";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <NavBar />
      <section className="relative w-full bg-gradient-to-b from-orange-500 to-orange-100 pb-20 pt-16 md:pt-24 text-black overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center pt-10 md:pt-20">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Privacy Policy</h1>
          <p className="text-lg md:text-xl mb-2 text-gray-700 text-center max-w-2xl">Your privacy is important to us. Learn how Portokalle protects your data and respects your rights.</p>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
            <span className="hover:underline cursor-pointer"><Link href="/">Home</Link></span>
            <span>/</span>
            <span className="font-semibold text-orange-500">Privacy Policy</span>
          </div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full" height="60" viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="#fff" d="M0,0 C480,60 960,0 1440,60 L1440,60 L0,60 Z"/></svg>
      </section>
      <main className="flex-1 flex flex-col items-center justify-center px-2 py-8 bg-white">
        <div className="max-w-3xl w-full flex flex-col gap-10 animate-fade-in">
          <section className="bg-white rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">Privacy Policy</h2>
            <p className="text-gray-700 mb-4">Portokalle is committed to protecting your privacy and handling your data in accordance with the highest standards of data protection and security.</p>
            <h2 className="text-xl font-bold mt-8 mb-2">What Data We Collect</h2>
            <p className="text-gray-700 mb-2">We only collect the minimum information necessary to provide our services. This includes your email address and a password (which is securely encrypted and never visible to us). We do <span className="font-semibold text-orange-500">not</span> store any medical records or personal health data.</p>
            <h2 className="text-xl font-bold mt-8 mb-2">How Your Data is Stored</h2>
            <p className="text-gray-700 mb-2">All data is stored in a secure, encrypted environment using industry-standard security practices. We take all reasonable steps to protect your information from unauthorized access, disclosure, or loss.</p>
            <h2 className="text-xl font-bold mt-8 mb-2">Your Rights</h2>
            <p className="text-gray-700 mb-2">You have the right to access, update, or delete your personal information at any time. For any privacy-related requests, please contact us at <a href="mailto:info@portokalle.al" className="text-orange-500 hover:underline">info@portokalle.al</a>.</p>
            <h2 className="text-xl font-bold mt-8 mb-2">Data Protection Standards</h2>
            <p className="text-gray-700 mb-2">Portokalle complies with all applicable data protection laws and regulations. We do not sell or share your data with third parties. Your privacy and security are our top priorities.</p>
            <h2 className="text-xl font-bold mt-8 mb-2">Security</h2>
            <p className="text-gray-700 mb-2">We use advanced security measures to safeguard your data. While no system is completely immune to risks, we are dedicated to keeping your information as safe as possible.</p>
            <h2 className="text-xl font-bold mt-8 mb-2">Policy Updates</h2>
            <p className="text-gray-700 mb-2">We may update this Privacy Policy from time to time. Any significant changes will be posted on this page.</p>
          </section>
        </div>
      </main>
      <FooterSection />
    </div>
  );
}
