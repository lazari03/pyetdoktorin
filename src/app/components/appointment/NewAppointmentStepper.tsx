'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DoctorSearch from '@/app/components/doctor/DoctorSearch';
import useNewAppointment from '@/hooks/useNewAppointment';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import AppointmentConfirmation from './AppointmentConfirmation';

export default function NewAppointmentStepper() {
	const { t } = useTranslation();
	const {
		selectedDoctor,
		setSelectedDoctor,
		appointmentType,
		setAppointmentType,
		preferredDate,
		setPreferredDate,
		preferredTime,
		setPreferredTime,
		notes,
		setNotes,
		handleSubmit,
		isSubmitting,
		availableTimes,
	} = useNewAppointment();
	const nav = useNavigationCoordinator();
	const [step, setStep] = useState(0);
	const [showModal, setShowModal] = useState(false);

	const steps = [
		t('selectDoctor'),
		t('chooseDateAndTime'),
		t('addNotesAndConfirm'),
	];

	// Progress calculation
	const progressPercent = ((step + 1) / steps.length) * 100;

	// Step 1: Doctor selection
	const renderDoctorStep = () => (
		<div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
			<h2 className="font-bold text-xl mb-2">{t('findADoctor')}</h2>
			<DoctorSearch
				onDoctorSelect={(doctor) => {
					setSelectedDoctor({
						...doctor,
						specialization: Array.isArray(doctor.specialization)
							? doctor.specialization.join(', ')
							: doctor.specialization || 'General',
					});
					setStep(1);
				}}
			/>
		</div>
	);

	// Step 2: Date & Time
	const renderDateTimeStep = () => (
		<div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
			<h2 className="font-bold text-xl mb-2">{t('chooseDateAndTime')}</h2>
			<div>
				<label className="block text-sm font-medium mb-1">{t('appointmentType')}</label>
				<select
					className="select select-bordered w-full"
					value={appointmentType}
					onChange={(e) => setAppointmentType(e.target.value)}
					required
				>
					<option value="">{t('selectAppointmentType')}</option>
					<option value="Check-up">{t('checkUp')}</option>
					<option value="Follow-up">{t('followUp')}</option>
					<option value="Consultation">{t('consultation')}</option>
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
					required
				/>
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">{t('preferredTime')}</label>
				<select
					className="select select-bordered w-full"
					value={preferredTime}
					onChange={(e) => setPreferredTime(e.target.value)}
					required
				>
					<option value="" disabled>{t('selectTime')}</option>
					{Array.isArray(availableTimes) &&
						availableTimes
							.filter((t: { time: string; disabled: boolean }) => !t.disabled)
							.map((t: { time: string }) => (
								<option key={t.time} value={t.time}>{t.time}</option>
							))}
				</select>
			</div>
			<div className="flex justify-between mt-2">
				<button
					className="px-4 py-1.5 rounded-full border border-orange-500 text-orange-500 bg-white hover:bg-orange-50 transition font-semibold text-sm"
					onClick={() => setStep(0)}
				>
					{t('back')}
				</button>
				<button
					className="px-4 py-1.5 rounded-full bg-orange-500 text-white font-semibold shadow hover:bg-orange-600 transition text-sm"
					onClick={() => setStep(2)}
					disabled={!preferredDate || !preferredTime || !appointmentType}
				>
					{t('next')}
				</button>
			</div>
		</div>
	);

	// Step 3: Notes & Confirm
	const renderNotesStep = () => (
		<form
			className="flex flex-col gap-4 w-full max-w-sm mx-auto"
			onSubmit={async (e) => {
				e.preventDefault();
				await handleSubmit(e, setShowModal, () => {});
			}}
		>
			<h2 className="font-bold text-xl mb-2">{t('addNotesAndConfirm')}</h2>
			<div>
				<label className="block text-sm font-medium mb-1">{t('notesLabel')}</label>
				<textarea
					className="textarea textarea-bordered w-full"
					rows={3}
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					placeholder={t('notesPlaceholder')}
				></textarea>
			</div>
			<div className="flex justify-between mt-2">
				<button
					className="px-6 py-2 rounded-full border border-orange-500 text-orange-500 bg-white hover:bg-orange-50 transition font-semibold"
					type="button"
					onClick={() => setStep(1)}
				>
					{t('back')}
				</button>
				<button
					className="px-6 py-2 rounded-full bg-orange-500 text-white font-semibold shadow hover:bg-orange-600 transition"
					type="submit"
					disabled={isSubmitting}
				>
					{isSubmitting ? t('booking') : t('confirm')}
				</button>
			</div>
		</form>
	);

	return (
		<div className="w-full max-w-3xl mx-auto mt-10">
			{/* Progress Bar */}
			<div className="w-full bg-gray-100 rounded-2xl h-3 mb-10 shadow-sm">
				<div
					className="bg-orange-500 h-3 rounded-2xl transition-all shadow-md"
					style={{ width: `${progressPercent}%` }}
				></div>
			</div>
			<div className="flex gap-8">
				{/* Step Panels */}
				<div className="flex-1">
					<div className="bg-white rounded-3xl shadow-lg p-8 min-h-[350px] flex flex-col justify-center">
						{step === 0 && renderDoctorStep()}
						{step === 1 && renderDateTimeStep()}
						{step === 2 && renderNotesStep()}
					</div>
				</div>
				{/* Optionally, show summary or doctor info on the right for steps 1/2/3 */}
				{selectedDoctor && (
					<div className="flex-1 hidden md:block bg-white rounded-3xl shadow-lg p-8 ml-4 min-h-[350px] flex flex-col justify-center border border-gray-100">
						<h3 className="font-bold text-lg mb-4 text-gray-700">{t('selectedDoctor')}</h3>
						<div className="mb-2 text-xl font-semibold text-orange-500">{selectedDoctor.name}</div>
						<div className="mb-4 text-sm text-gray-500">{selectedDoctor.specialization}</div>
						{preferredDate && <div className="mb-1 text-gray-600">{t('date')}: <span className="font-medium">{preferredDate}</span></div>}
						{preferredTime && <div className="mb-1 text-gray-600">{t('time')}: <span className="font-medium">{preferredTime}</span></div>}
						{appointmentType && <div className="mb-1 text-gray-600">{t('type')}: <span className="font-medium">{appointmentType}</span></div>}
					</div>
				)}
			</div>
			{/* Confirmation Modal */}
			{showModal && (
				<AppointmentConfirmation onClose={() => nav.toAppointments()} />
			)}
		</div>
	);
}