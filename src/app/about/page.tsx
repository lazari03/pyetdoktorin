"use client";


import React from "react";
import Link from "next/link";
import Image from "next/image";
import FooterSection from "../components/footerSection";
import NavBar from "../components/navBar";

export default function AboutPage() {
		return (
			<div className="min-h-screen flex flex-col bg-white text-black">
				<NavBar />
				{/* Hero Section */}
				<section className="relative w-full bg-gradient-to-b from-orange to-orange pb-20 pt-16 md:pt-24 text-black overflow-hidden">
				<div className="max-w-5xl mx-auto px-4 flex flex-col items-center pt-10 md:pt-20">
						<h1 className="text-4xl md:text-5xl font-extrabold mb-4">About Us</h1>
						<p className="text-lg md:text-xl mb-2 text-gray-700 text-center max-w-2xl">Read more about us, our vision, mission, and the story behind Portokalle.</p>
									<div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
										<span className="hover:underline cursor-pointer"><Link href="/">Home</Link></span>
										<span>/</span>
										<span className="font-semibold text-orange">About</span>
						</div>
					</div>
					<svg className="absolute bottom-0 left-0 w-full" height="60" viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="#fff" d="M0,0 C480,60 960,0 1440,60 L1440,60 L0,60 Z"/></svg>
				</section>

				{/* Main Content Sections */}
				<main className="flex-1 flex flex-col items-center justify-center px-2 py-8 bg-white">
					<div className="max-w-5xl w-full flex flex-col gap-20 animate-fade-in">
						{/* Section 1: About/Intro */}
						<section className="flex flex-col md:flex-row items-center gap-10 md:gap-20">
							<div className="md:w-1/2 w-full order-2 md:order-1">
								<h2 className="text-2xl md:text-3xl font-bold mb-4">We help connect healthcare for everyone</h2>
								<p className="text-base md:text-lg text-gray-700 mb-4">
									Portokalle is a digital healthcare platform connecting individuals, doctors, and clinics in one seamless experience. We simplify appointment booking, consultation management, and clinic operations for everyone.
								</p>
								<div className="flex gap-3 mt-4">
									<span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full font-semibold text-sm">Mission</span>
									<span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full font-semibold text-sm">Vision</span>
									<span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full font-semibold text-sm">Our Value</span>
								</div>
							</div>
							<div className="md:w-1/2 w-full flex justify-center order-1 md:order-2">
								<Image src="/img/logo.png" alt="Portokalle Logo" width={224} height={224} className="w-56 h-56 object-contain rounded-2xl bg-white p-4" priority />
							</div>
						</section>

						{/* Section 2: Application/Team Photo */}
						<section className="flex flex-col md:flex-row items-center gap-10 md:gap-20">
							<div className="md:w-1/2 w-full flex justify-center mb-6 md:mb-0">
								<Image src="https://portokalle-storage.fra1.digitaloceanspaces.com/img/pexels-karolina-grabowska-7195123.jpg" alt="Team" width={448} height={224} className="w-full max-w-md h-56 object-cover rounded-2xl" priority />
							</div>
							<div className="md:w-1/2 w-full">
								<h2 className="text-2xl md:text-3xl font-bold mb-4">Take a vital look at our application working</h2>
								<p className="text-base md:text-lg text-gray-700">
									By accessing and using the Portokalle platform, you agree to be bound by our terms of service. Our team is dedicated to providing the best possible support and technology for our users.
								</p>
							</div>
						</section>

						{/* Section 3: Stats */}
						<section className="w-full flex flex-wrap justify-center gap-8 py-10 bg-orange rounded-2xl shadow-xl">
							<div className="flex flex-col items-center">
								<span className="text-3xl md:text-4xl font-extrabold text-white">4+</span>
								<span className="text-base text-orange">Years Experience</span>
							</div>
							<div className="flex flex-col items-center">
								<span className="text-3xl md:text-4xl font-extrabold text-white">99%</span>
								<span className="text-base text-orange">Satisfaction Rate</span>
							</div>
							<div className="flex flex-col items-center">
								<span className="text-3xl md:text-4xl font-extrabold text-white">500+</span>
								<span className="text-base text-orange">Positive Reviews</span>
							</div>
							<div className="flex flex-col items-center">
								<span className="text-3xl md:text-4xl font-extrabold text-white">600+</span>
								<span className="text-base text-orange">Trusted Partners</span>
							</div>
						</section>

						{/* Section 4: Features/Benefits */}
									<section className="w-full grid md:grid-cols-3 gap-8 bg-white rounded-2xl p-8">
										<div className="flex flex-col items-center text-center">
											<div className="w-16 h-16 mb-4 rounded-full bg-orange flex items-center justify-center">
												<svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke="#58becc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
											</div>
											<h3 className="font-bold text-lg mb-2">Book online consultations</h3>
											<p className="text-gray-700">Easily book and manage online consultations with healthcare professionals from anywhere.</p>
										</div>
										<div className="flex flex-col items-center text-center">
											<div className="w-16 h-16 mb-4 rounded-full bg-orange flex items-center justify-center">
												<svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M12 20V4m0 0l-7 7m7-7l7 7" stroke="#58becc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
											</div>
											<h3 className="font-bold text-lg mb-2">We set the bar</h3>
											<p className="text-gray-700">We use the latest technology and best practices to ensure the highest standards in digital healthcare.</p>
										</div>
										<div className="flex flex-col items-center text-center">
											<div className="w-16 h-16 mb-4 rounded-full bg-orange flex items-center justify-center">
												<svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 9V7a5 5 0 0110 0v2" stroke="#58becc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
											</div>
											<h3 className="font-bold text-lg mb-2">Seamless experience</h3>
											<p className="text-gray-700">Enjoy a seamless, secure, and user-friendly experience for all your healthcare needs.</p>
										</div>
						</section>
					</div>
				</main>
				<FooterSection />
			</div>
		);
}
