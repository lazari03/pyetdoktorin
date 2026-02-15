'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useDoctorProfile } from '@/presentation/hooks/useDoctorProfile';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { CalendarDaysIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import AppointmentModal from '../appointment/AppointmentModal';

interface DoctorProfileProps {
	id: string;
}

export default function DoctorProfile({ id }: DoctorProfileProps) {
	const { doctor, loading, error } = useDoctorProfile(id);
	const { user } = useAuth();
	const { t } = useTranslation();
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleRequestAppointment = useCallback(() => {
		if (!user) {
			alert(t('signInToBookError'));
			return;
		}
		setIsModalOpen(true);
	}, [user, t]);

	if (loading) {
		return (
			<div className="min-h-[60vh] flex items-center justify-center">
				<div className="flex flex-col items-center gap-3">
					<div className="h-10 w-10 rounded-full border-2 border-purple-200 border-t-purple-600 animate-spin" />
					<p className="text-sm text-gray-500">{t('loading')}...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-[40vh] flex items-center justify-center">
				<div className="rounded-2xl bg-red-50 border border-red-100 px-6 py-4 text-sm text-red-600">
					{error}
				</div>
			</div>
		);
	}

	if (!doctor) return null;

	return (
		<div className="min-h-screen">
			<div className="mx-auto max-w-3xl px-4 py-8 lg:py-14 space-y-6">
				{/* Header breadcrumb */}
				<p className="text-xs uppercase tracking-[0.18em] text-purple-600 font-semibold">
					{t('doctorProfile')}
				</p>

				{/* Main card */}
				<div className="rounded-3xl bg-white border border-purple-50 shadow-sm overflow-hidden">
					{/* Top section — photo + name */}
					<div className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8">
						<DoctorImage name={doctor.name} profilePicture={doctor.profilePicture} />
						<div className="flex-1 text-center sm:text-left space-y-2">
							<h1 className="text-2xl font-semibold text-gray-900">
								{doctor.name}
							</h1>
							{doctor.specialization?.length > 0 && (
								<div className="flex flex-wrap justify-center sm:justify-start gap-2">
									{(Array.isArray(doctor.specialization) ? doctor.specialization : [doctor.specialization]).map((spec, i) => (
										<span
											key={i}
											className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700"
										>
											{spec}
										</span>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Divider */}
					<div className="mx-6 sm:mx-8 border-t border-gray-100" />

					{/* Bio section */}
					<div className="p-6 sm:p-8 space-y-3">
						{doctor.bio ? (
							<>
								<h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
									<UserCircleIcon className="h-4 w-4 text-purple-500" />
									{t('about')}
								</h2>
								<p className="text-sm text-gray-600 leading-relaxed">
									{doctor.bio}
								</p>
							</>
						) : (
							<p className="text-sm text-gray-400 italic">
								{t('noBioAvailable') ?? 'No biography available.'}
							</p>
						)}
					</div>

					{/* Divider */}
					<div className="mx-6 sm:mx-8 border-t border-gray-100" />

					{/* Action footer */}
					<div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-3">
						<button
							onClick={handleRequestAppointment}
							className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 transition-colors"
						>
							<CalendarDaysIcon className="h-4 w-4" />
							{t('bookNewAppointment')}
						</button>
						<button
							onClick={() => window.history.back()}
							className="inline-flex items-center rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
						>
							{t('goBack') ?? 'Go back'}
						</button>
					</div>
				</div>
			</div>

			{isModalOpen && (
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
	const imageUrl = profilePicture || '/img/profile_placeholder.png';
	return (
		<div className="relative flex-shrink-0">
			<div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-purple-100 shadow-md bg-gray-100">
				<Image
					src={imageUrl}
					alt={name || 'Doctor'}
					width={144}
					height={144}
					className="object-cover w-full h-full"
				/>
			</div>
		</div>
	);
}
