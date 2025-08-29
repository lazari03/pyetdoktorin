"use client";

import React from "react";
import Link from "next/link";
import FooterSection from "../components/footerSection";
import NavBar from "../components/navBar";

export default function ContactPage() {
  return (
            <div className="min-h-screen flex flex-col bg-white text-black">
              <NavBar />
              {/* Hero Section */}
              <section className="relative w-full bg-gradient-to-b from-orange-500 to-orange-100 pb-20 pt-16 md:pt-24 text-black overflow-hidden">
                <div className="max-w-5xl mx-auto px-4 flex flex-col items-center pt-10 md:pt-20">
                  <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Contact Us</h1>
                  <p className="text-lg md:text-xl mb-2 text-gray-700 text-center max-w-2xl">We&apos;re here to help! Reach out to our team for support, partnership, or any questions about Portokalle.</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <span className="hover:underline cursor-pointer"><Link href="/">Home</Link></span>
                    <span>/</span>
                    <span className="font-semibold text-orange-500">Contact</span>
                  </div>
                </div>
                <svg className="absolute bottom-0 left-0 w-full" height="60" viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="#fff" d="M0,0 C480,60 960,0 1440,60 L1440,60 L0,60 Z"/></svg>
              </section>

              {/* Main Content Sections */}
              <main className="flex-1 flex flex-col items-center justify-center px-2 py-8 bg-white">
                <div className="max-w-5xl w-full flex flex-col gap-20 animate-fade-in">
                  {/* Section 1 & 2: Contact Info/Intro and Contact Form side by side */}
                  <section className="flex flex-col md:flex-row items-stretch gap-10 md:gap-20">
                    {/* Left: Info */}
                    <div className="md:w-1/2 w-full flex flex-col justify-center">
                      <h2 className="text-2xl md:text-3xl font-bold mb-4">Get in touch with our team</h2>
                      <p className="text-base md:text-lg text-gray-700 mb-4">
                        Whether you have a question about features, pricing, need a demo, or anything else, our team is ready to answer all your questions.
                      </p>
                      <div className="flex flex-col gap-2 mt-4">
                        <span className="font-semibold">Email: <a href="mailto:info@portokalle.com" className="text-orange-500 hover:underline">support@portokalle.com</a></span>
                      </div>
                    </div>
                    {/* Right: Form */}
                    <div className="md:w-1/2 w-full flex flex-col justify-center">
                      <h2 className="text-2xl md:text-3xl font-bold mb-4">Send us a message</h2>
                      <form className="flex flex-col gap-4">
                        <input type="text" placeholder="Your Name" className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" required />
                        <input type="email" placeholder="Your Email" className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" required />
                        <textarea placeholder="Your Message" className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" rows={4} required />
                        <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">Send Message</button>
                      </form>
                    </div>
                  </section>

                  {/* Section 3: Stats */}
                  <section className="w-full flex flex-wrap justify-center gap-8 py-10 bg-orange-500 rounded-2xl shadow-xl">
                    <div className="flex flex-col items-center">
                      <span className="text-3xl md:text-4xl font-extrabold text-white">24/7</span>
                      <span className="text-base text-orange-100">Support</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl md:text-4xl font-extrabold text-white">100%</span>
                      <span className="text-base text-orange-100">Response Rate</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl md:text-4xl font-extrabold text-white">10+</span>
                      <span className="text-base text-orange-100">Team Members</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl md:text-4xl font-extrabold text-white">5+</span>
                      <span className="text-base text-orange-100">Languages Supported</span>
                    </div>
                  </section>

                  {/* Section 4: Features/Benefits */}
                  <section className="w-full grid md:grid-cols-3 gap-8 bg-white rounded-2xl p-8">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 mb-4 rounded-full bg-orange-50 flex items-center justify-center">
                        <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M21 10V6a2 2 0 00-2-2H5a2 2 0 00-2 2v4" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <h3 className="font-bold text-lg mb-2">Fast Response</h3>
                      <p className="text-gray-700">Our team is dedicated to responding to your inquiries as quickly as possible.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 mb-4 rounded-full bg-orange-50 flex items-center justify-center">
                        <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16h6" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <h3 className="font-bold text-lg mb-2">Multi-Channel</h3>
                      <p className="text-gray-700">Contact us via email, phone, or our online form—whatever works best for you.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 mb-4 rounded-full bg-orange-50 flex items-center justify-center">
                        <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <h3 className="font-bold text-lg mb-2">Secure & Private</h3>
                      <p className="text-gray-700">Your messages and data are handled with the utmost security and privacy.</p>
                    </div>
                  </section>
                </div>
              </main>
      <FooterSection />
    </div>
  );
}
