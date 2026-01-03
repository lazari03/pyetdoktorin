import React from 'react';
import Image from 'next/image';

export default function DoctorStatsSection() {
	return (
		<section className="relative min-h-[50vh] flex items-center justify-center bg-white py-16 px-2 overflow-hidden mb-10">
			<div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 relative">
				{/* Left: Image */}
				<div className="hidden md:flex flex-1 items-center justify-center">
					<Image
						src="https://portokalle-storage.fra1.digitaloceanspaces.com/img/pexels-shvetsa-4225920.jpg"
						alt="Doctor Telemedicine"
						width={380}
						height={380}
						className="object-cover w-full h-72 sm:h-80 border-orange-100 bg-white"
						priority
					/>
				</div>
				{/* Right: Stats */}
				<div className="flex-1 flex flex-col justify-center items-center text-center px-2 md:px-0">
					<h3 className="text-sm font-semibold text-orange-600 uppercase tracking-widest mb-2">Your Impact</h3>
					<h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">Grow your practice with Portokalle</h2>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl text-gray-700 mb-8">
						<div className="flex flex-col items-center">
							<span className="text-3xl font-extrabold text-orange-500 mb-1">124</span>
							<span className="text-sm text-gray-600">Patients Consulted</span>
						</div>
						<div className="flex flex-col items-center">
							<span className="text-3xl font-extrabold text-orange-500 mb-1">€35</span>
							<span className="text-sm text-gray-600">Per Consultation</span>
						</div>
						<div className="flex flex-col items-center">
							<span className="text-3xl font-extrabold text-orange-500 mb-1">7</span>
							<span className="text-sm text-gray-600">Upcoming Appointments</span>
						</div>
					</div>
					<p className="text-base text-gray-700 mb-2">Track your consultations, earnings, and appointments in one place.</p>
				</div>
			</div>
		</section>
	);
}