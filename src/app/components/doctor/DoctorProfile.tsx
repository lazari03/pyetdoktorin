'use client';


import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Doctor } from '@/domain/entities/Doctor';
import { useDoctorProfile } from '@/hooks/useDoctorProfile';
import { useAuth } from '@/context/AuthContext';
import AppointmentModal from '../appointment/AppointmentModal';

interface DoctorProfileProps {
	id: string;
}

export default function DoctorProfile({ id }: DoctorProfileProps) {
	const { doctor, loading, error } = useDoctorProfile(id);
	const { user } = useAuth(); // Removed unused `role`
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleRequestAppointment = useCallback(() => {
		if (!user) {
			alert('You must be logged in to request an appointment.');
			return;
		}

		setIsModalOpen(true);
	}, [user]);

	if (loading) return <p>Loading...</p>;
	if (error) return <p className="text-red-500">{error}</p>;

		return (
			<div className="w-full max-w-4xl mx-auto p-3 md:p-6">
				<div className="card bg-base-100 shadow-xl overflow-hidden flex flex-col md:flex-row">
					{doctor && (
						<DoctorImage name={doctor.name} profilePicture={doctor.profilePicture} />
					)}
					<DoctorDetails doctor={doctor} onRequestAppointment={handleRequestAppointment} />
				</div>

				{isModalOpen && doctor && (
					<AppointmentModal
						isOpen={isModalOpen}
						onClose={() => setIsModalOpen(false)}
						doctor={{ id: doctor.id, name: doctor.name }} // Pass doctor details
					/>
				)}
			</div>
		);
}

function DoctorImage({ name, profilePicture }: { name?: string; profilePicture?: string }) {
	const imageUrl = profilePicture || "/img/profile_placeholder.png";
	return (
		<figure className="w-full md:w-1/3 p-6 flex items-center justify-center">
			<Image
				src={imageUrl}
				alt={name || 'Doctor'}
				width={192}
				height={192}
				className="object-cover rounded-full"
			/>
		</figure>
	);
}

function DoctorDetails({ doctor, onRequestAppointment }: { doctor: Doctor | null; onRequestAppointment: () => void }) {
	if (!doctor) {
		return <p className="text-red-500">Doctor details are not available.</p>;
	}

	return (
		<div className="card-body w-full md:w-2/3 p-6">
			<h2 className="card-title text-3xl">
				{doctor.name}
			</h2>
			{/* No about, education, or surname fields in Doctor type */}
			<div className="divider my-3"></div>
			<DoctorList title="Specializations" items={doctor.specialization} fallback="No specializations listed" />
			<div className="card-actions justify-end mt-6">
				<button className="btn btn-primary" onClick={onRequestAppointment}>
					Request Appointment
				</button>
			</div>
		</div>
	);
}

function DoctorList({ title, items, fallback }: { title: string; items?: string[]; fallback: string }) {
	return (
		<div>
			<h3 className="font-semibold text-lg mb-1">{title}</h3>
			{items && items.length > 0 ? (
				<ul className="list-disc list-inside ml-4">
					{items.map((item, idx) => (
						<li key={idx}>{item}</li>
					))}
				</ul>
			) : (
				<p className="text-gray-500 text-sm">{fallback}</p>
			)}
		</div>
	);
}