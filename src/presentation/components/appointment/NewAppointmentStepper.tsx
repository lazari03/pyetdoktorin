'use client';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DoctorSearch from '@/presentation/components/doctor/DoctorSearch';
import useNewAppointment from '@/hooks/useNewAppointment';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';

import { useNewAppointmentViewModel } from '@/presentation/view-models/useNewAppointmentViewModel';

export default function NewAppointmentStepper() {
	const { t } = useTranslation();
	const vm = useNewAppointmentViewModel();

	return (
		<div className="w-full max-w-6xl mx-auto mt-10">
			{/* Header & subtitle */}
			<div className="mb-8 text-center">
				<h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
					{t('bookNewAppointment') || 'Book a new appointment'}
				</h1>
				<p className="text-sm md:text-base text-gray-500">
					{t('bookNewAppointmentSubtitle') ||
						'Choose your doctor, pick a time, and add any notes in one simple view.'}
				</p>
			</div>

			<div className="flex flex-col lg:flex-row gap-6">
				{/* Column 1: Doctor search */}
				<div className="lg:w-1/3 bg-white rounded-3xl border border-gray-100 p-6 flex flex-col">
					<h2 className="font-semibold text-lg text-gray-900 mb-1">
						{t('selectDoctor')}
					</h2>
					<p className="text-xs text-gray-500 mb-4">
						{t('selectDoctorDescription') ||
							'Search and choose the clinician you would like to meet with.'}
					</p>
					<DoctorSearch onDoctorSelect={vm.handleDoctorSelect} />
				</div>

				{/* Column 2: Date, time (Calendly-like), notes */}
				<form
					onSubmit={vm.handleFormSubmit}
					className="lg:w-1/3 bg-white rounded-3xl border border-gray-100 p-6 flex flex-col gap-4"
				>
					<h2 className="font-semibold text-lg text-gray-900 mb-1">
						{t('chooseDateAndTime')}
					</h2>
					<p className="text-xs text-gray-500 mb-4">
						{t('chooseDateAndTimeDescription') ||
							'Pick a date, then select a time that works best for you.'}
					</p>

					{/* Appointment type */}
					<div>
						<label className="block text-sm font-medium mb-1 text-gray-700">
							{t('appointmentType')}
						</label>
						<select
							className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white"
							value={vm.appointmentType}
							onChange={(e) => vm.setAppointmentType(e.target.value)}
							required
						>
							<option value="">{t('selectAppointmentType')}</option>
							<option value="Check-up">{t('checkUp')}</option>
							<option value="Follow-up">{t('followUp')}</option>
							<option value="Consultation">{t('consultation')}</option>
						</select>
					</div>

					{/* Date picker */}
					<div>
						<label className="block text-sm font-medium mb-1 text-gray-700">
							{t('preferredDate')}
						</label>
						<input
							type="date"
							className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white"
							value={vm.preferredDate}
							onChange={(e) => vm.setPreferredDate(e.target.value)}
							min={vm.minDate}
							required
						/>
					</div>

					{/* Calendly-style time slots */}
					<div>
						<label className="block text-sm font-medium mb-2 text-gray-700">
							{t('preferredTime')}
						</label>
						<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
							{vm.visibleTimeSlots.length === 0 && (
								<div className="col-span-full text-xs text-gray-400">
									{t('noAvailableTimes') || 'No available times for this day.'}
								</div>
							)}
							{vm.visibleTimeSlots.map((slot) => {
								const isSelected = vm.preferredTime === slot.time;
								return (
									<button
										key={slot.time}
										type="button"
										onClick={() => vm.setPreferredTime(slot.time)}
										className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors text-center ${
											isSelected
												? 'bg-primary border-primary text-white'
												: 'bg-white border-gray-300 text-gray-800 hover:border-primary hover:text-primary'
										}`}
									>
										{slot.time}
									</button>
								);
							})}
						</div>
					</div>

					{/* Notes */}
					<div>
						<label className="block text-sm font-medium mb-1 text-gray-700">
							{t('notesLabel')}
						</label>
						<textarea
							className="w-full rounded-2xl border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white min-h-[96px]"
							rows={3}
							value={vm.notes}
							onChange={(e) => vm.setNotes(e.target.value)}
							placeholder={t('notesPlaceholder')}
						></textarea>
					</div>

					{/* Submit */}
					<div className="mt-2 flex justify-end">
						<button
							className="px-6 py-2 rounded-full bg-primary text-white font-semibold text-sm hover:bg-secondary transition disabled:opacity-60"
							type="submit"
							disabled={!vm.canSubmit}
						>
							{vm.isSubmitting ? t('booking') : t('confirm')}
						</button>
					</div>
				</form>

				{/* Column 3: Summary */}
				<div className="lg:w-1/3 bg-white rounded-3xl border border-gray-100 p-6 flex flex-col">
					<h2 className="font-semibold text-lg text-gray-900 mb-4">
						{t('appointmentSummary') || 'Appointment summary'}
					</h2>
					{!vm.hasSummaryContent ? (
						<p className="text-sm text-gray-400">
							{t('appointmentSummaryEmpty') || 'Start by selecting a doctor and time on the left.'}
						</p>
					) : (
						<div className="space-y-2 text-sm text-gray-700">
							{vm.selectedDoctor && (
								<div>
									<div className="text-xs uppercase tracking-wide text-gray-400 mb-0.5">
										{t('doctor')}
									</div>
									<div className="font-medium text-gray-900">{vm.selectedDoctor.name}</div>
									<div className="text-xs text-gray-500">{vm.selectedDoctor.specialization}</div>
								</div>
							)}
							{vm.preferredDate && (
								<div>
									<div className="text-xs uppercase tracking-wide text-gray-400 mb-0.5">
										{t('date')}
									</div>
									<div className="font-medium">{vm.preferredDate}</div>
								</div>
							)}
							{vm.preferredTime && (
								<div>
									<div className="text-xs uppercase tracking-wide text-gray-400 mb-0.5">
										{t('time')}
									</div>
									<div className="font-medium">{vm.preferredTime}</div>
								</div>
							)}
							{vm.appointmentType && (
								<div>
									<div className="text-xs uppercase tracking-wide text-gray-400 mb-0.5">
										{t('type')}
									</div>
									<div className="font-medium">{vm.appointmentType}</div>
								</div>
							)}
							{vm.notes && (
								<div>
									<div className="text-xs uppercase tracking-wide text-gray-400 mb-0.5">
										{t('notesLabel')}
									</div>
									<div className="text-gray-700 whitespace-pre-line">{vm.notes}</div>
								</div>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Confirmation Modal */}
			{vm.showModal && <AppointmentConfirmation onClose={vm.handleCloseModal} />}
		</div>
	);
}
