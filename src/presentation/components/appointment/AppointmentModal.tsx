'use client';

import { useEffect, useState } from 'react';
import useNewAppointment from '@/presentation/hooks/useNewAppointment';
import AppointmentConfirmation from './AppointmentConfirmation';
import { useTranslation } from 'react-i18next';
import { z } from '@/config/zIndex';

export default function AppointmentModal({
	isOpen,
	onClose,
	doctor,
}: {
	isOpen: boolean;
	onClose: () => void;
	doctor: { id: string; name: string; specialization?: string };
}) {

	const {
		setSelectedDoctor,
		handleSubmit,
	} = useNewAppointment();
	const { t } = useTranslation();

	const [showConfirmation, setShowConfirmation] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setSelectedDoctor({
				...doctor,
				specialization: doctor.specialization || t('generalSpecialization'),
			});
		}
	}, [isOpen, doctor, setSelectedDoctor, t]);


	if (!isOpen) return null;
	if (showConfirmation) {
		return <AppointmentConfirmation onClose={() => { setShowConfirmation(false); onClose(); }} />;
	}

	return (
	<div className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-4 ${z.modal}`}>
			<div className={`bg-white rounded-lg shadow-lg w-full max-w-md p-6 ${z.modalContent}`}>
				<h2 className="text-xl font-bold mb-4">{t('newAppointment')}</h2>
				<form
					className="space-y-4"
					onSubmit={async (e) => {
						e.preventDefault();
						await handleSubmit(e, () => setShowConfirmation(true), () => {});
					}}
				>
					{/* ...form fields... */}
				</form>
			</div>
		</div>
	);
}
