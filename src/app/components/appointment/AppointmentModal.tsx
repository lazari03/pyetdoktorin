'use client';

import { useEffect, useState } from 'react';
import useNewAppointment from '@/hooks/useNewAppointment';
import AppointmentConfirmation from './AppointmentConfirmation';
import { useTranslation } from 'react-i18next';

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
		appointmentType,
		setAppointmentType,
		preferredDate,
		setPreferredDate,
		preferredTime,
		setPreferredTime,
		notes,
		setNotes,
		availableTimes,
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
	<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
			<div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
				<h2 className="text-xl font-bold mb-4">{t('newAppointment')}</h2>
				<form
					className="space-y-4"
					onSubmit={async (e) => {
						e.preventDefault();
						await handleSubmit(e, () => setShowConfirmation(true), () => {});
					}}
				>
					<div>
						<label className="block text-sm font-medium mb-1">{t('doctorName')}</label>
						<input
							type="text"
							className="input input-bordered w-full"
							value={doctor.name}
							disabled
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">{t('appointmentType')}</label>
						<select
							className="select select-bordered w-full"
							value={appointmentType}
							onChange={(e) => setAppointmentType(e.target.value)}
						>
							<option>{t('checkUp')}</option>
							<option>{t('followUp')}</option>
							<option>{t('consultation')}</option>
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">{t('preferredDate')}</label>
						<input
							type="date"
							className="input input-bordered w-full"
							value={preferredDate}
							onChange={(e) => setPreferredDate(e.target.value)}
							min={new Date().toISOString().split('T')[0]}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">{t('preferredTime')}</label>
						<select
							className="select select-bordered w-full"
							value={preferredTime}
							onChange={(e) => setPreferredTime(e.target.value)}
						>
							<option value="" disabled>
								{t('selectTime')}
							</option>
							{availableTimes?.map(({ time, disabled }) => (
								<option key={time} value={time} disabled={disabled}>
									{time}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">{t('notes')}</label>
						<textarea
							className="textarea textarea-bordered w-full"
							rows={3}
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
						></textarea>
					</div>
					<div className="flex justify-end space-x-4">
						<button
							type="button"
							className="btn btn-outline"
							onClick={onClose}
						>
							{t('cancel')}
						</button>
						<button
							type="submit"
							className="btn btn-primary"
						>
							{t('confirm')}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}