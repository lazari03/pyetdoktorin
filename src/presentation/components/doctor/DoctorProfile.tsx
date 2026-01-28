'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Doctor } from '@/domain/entities/Doctor';
import { useDoctorProfile } from '@/presentation/hooks/useDoctorProfile';
import { useAuth } from '@/context/AuthContext';
import AppointmentModal from '../appointment/AppointmentModal';

interface DoctorProfileProps {
	id: string;
}

export default function DoctorProfile({ id }: DoctorProfileProps) {
	const { doctor, loading, error } = useDoctorProfile(id);
	const { user } = useAuth();
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
            <>
              <DoctorImage name={doctor.name} profilePicture={doctor.profilePicture} />
              <DoctorDetails doctor={doctor} onRequestAppointment={handleRequestAppointment} />
            </>
          )}
        </div>
			{isModalOpen && doctor && (
				<AppointmentModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					doctor={{ id: doctor.id, name: doctor.name }}
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
				className="rounded-full object-cover border-4 border-primary shadow-lg"
			/>
		</figure>
	);
}

function DoctorDetails({ doctor, onRequestAppointment }: { doctor?: Doctor; onRequestAppointment: () => void }) {
	if (!doctor) return null;
	return (
		<div className="flex-1 flex flex-col gap-4 p-6">
			<h2 className="text-2xl font-bold text-gray-900 mb-2">{doctor.name}</h2>
			<p className="text-gray-600 mb-2">{doctor.specialization}</p>
			<p className="text-gray-700 mb-4">{doctor.bio}</p>
			<button
				className="rounded-full bg-primary text-white font-semibold px-6 py-2 shadow hover:bg-secondary transition-colors w-max"
				onClick={onRequestAppointment}
			>
				Request Appointment
			</button>
		</div>
	);
}
