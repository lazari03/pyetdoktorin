'use client';
import { useTranslation } from 'react-i18next';
import DoctorSearch from '@/presentation/components/doctor/DoctorSearch';
import AppointmentConfirmation from './AppointmentConfirmation';

import { useNewAppointmentViewModel } from '@/presentation/view-models/useNewAppointmentViewModel';
import { useState } from 'react';
import { CalendarDaysIcon, ClipboardDocumentListIcon, UserCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function NewAppointmentStepper() {
	const { t } = useTranslation();
	const vm = useNewAppointmentViewModel();
	const steps = [
		{ key: 'doctor', title: t('stepChooseDoctor'), icon: UserCircleIcon },
		{ key: 'schedule', title: t('stepSchedule'), icon: CalendarDaysIcon },
		{ key: 'details', title: t('stepDetails'), icon: ClipboardDocumentListIcon },
		{ key: 'review', title: t('stepReview'), icon: ShieldCheckIcon },
	] as const;
	const [step, setStep] = useState(0);

	const canGoNext = () => {
		if (step === 0) return !!vm.selectedDoctor;
		if (step === 1) return !!(vm.appointmentType && vm.preferredDate && vm.preferredTime);
		return true;
	};

	const handleNext = () => {
		if (step < steps.length - 1 && canGoNext()) setStep(step + 1);
	};

	const handleBack = () => {
		if (step > 0) setStep(step - 1);
	};

	return (
		<div className="min-h-screen py-10 px-4">
			<div className="w-full max-w-5xl mx-auto space-y-8">
				{/* Header & subtitle */}
				<div className="flex items-start justify-between flex-wrap gap-4">
					<div>
						<p className="text-xs uppercase tracking-[0.18em] text-purple-600 font-semibold">
							{t('bookingFlowEyebrow') || 'Telehealth'}
						</p>
						<h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mt-1">
							{t('bookingFlowTitle') || 'Book your visit'}
						</h1>
						<p className="text-sm md:text-base text-gray-600">
							{t('bookingFlowSubtitle') || 'Follow the guided steps. No surprises, just care.'}
						</p>
					</div>
					<div className="bg-white/80 backdrop-blur rounded-2xl border border-purple-100 px-3 py-2 text-xs text-gray-600 shadow-sm">
						{t('bookingSecureNotice') || 'Your health information is protected and never shared.'}
					</div>
				</div>

				{/* Step indicator */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
					{steps.map((s, idx) => {
						const active = idx === step;
						const done = idx < step;
						const Icon = s.icon;
						return (
							<div
								key={s.key}
								className={`flex items-center gap-3 rounded-2xl border px-3 py-2 text-sm shadow-sm ${
									active
										? 'border-purple-400 bg-white'
										: done
										? 'border-purple-100 bg-white'
										: 'border-gray-200 bg-white/70'
								}`}
							>
								<div
									className={`h-9 w-9 rounded-full flex items-center justify-center ${
										active ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'
									}`}
								>
									<Icon className="h-5 w-5" />
								</div>
								<div className="flex-1">
									<p className="text-[11px] uppercase tracking-wide text-gray-500">
										{t('stepLabel', { current: idx + 1, total: steps.length }) || `Step ${idx + 1}`}
									</p>
									<p className="font-semibold text-gray-900">{s.title}</p>
								</div>
							</div>
						);
					})}
				</div>

				<form onSubmit={vm.handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Main panel */}
					<div className="lg:col-span-2 space-y-6">
						<div className="bg-white rounded-3xl border border-purple-50 shadow-lg p-6 space-y-5">
							{step === 0 && (
								<div className="space-y-3">
									<h2 className="text-lg font-semibold text-gray-900">{t('selectDoctor')}</h2>
									<p className="text-sm text-gray-600">
										{t('selectDoctorDescription') ||
											'Search for the clinician you trust. We highlight availability for you.'}
									</p>
									<DoctorSearch onDoctorSelect={vm.handleDoctorSelect} />
								</div>
							)}

							{step === 1 && (
								<div className="space-y-4">
									<div>
										<h2 className="text-lg font-semibold text-gray-900">{t('chooseDateAndTime')}</h2>
										<p className="text-sm text-gray-600">
											{t('chooseDateAndTimeDescription') ||
												'Pick a date, then choose a time that fits your day.'}
										</p>
									</div>

									<div>
										<label className="block text-sm font-medium mb-1 text-gray-700">
											{t('appointmentType')}
										</label>
										<select
											className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
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

									<div className="grid md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium mb-1 text-gray-700">
												{t('preferredDate')}
											</label>
											<input
												type="date"
												className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
												value={vm.preferredDate}
												onChange={(e) => vm.setPreferredDate(e.target.value)}
												min={vm.minDate}
												required
											/>
										</div>

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
															className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors text-center ${
																isSelected
																	? 'bg-purple-600 border-purple-600 text-white shadow-sm'
																	: 'bg-white border-gray-300 text-gray-800 hover:border-purple-400 hover:text-purple-700'
															}`}
														>
															{slot.time}
														</button>
													);
												})}
											</div>
										</div>
									</div>
								</div>
							)}

							{step === 2 && (
								<div className="space-y-3">
									<h2 className="text-lg font-semibold text-gray-900">{t('visitDetails')}</h2>
									<p className="text-sm text-gray-600">
										{t('addNotesOptional') || 'Share any symptoms or goals. Optional but helpful for your doctor.'}
									</p>
									<textarea
										className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white min-h-[140px]"
										rows={4}
										value={vm.notes}
										onChange={(e) => vm.setNotes(e.target.value)}
										placeholder={t('notesPlaceholder')}
									></textarea>
								</div>
							)}

							{step === 3 && (
								<div className="space-y-4">
									<h2 className="text-lg font-semibold text-gray-900">{t('reviewConfirm')}</h2>
									<p className="text-sm text-gray-600">{t('readyToConfirm') || 'Review the details before we reserve your slot.'}</p>
									<div className="grid md:grid-cols-2 gap-3">
										<SummaryItem label={t('doctor')} value={vm.selectedDoctor?.name || t('notSelected')} helper={vm.selectedDoctor?.specialization} />
										<SummaryItem label={t('appointmentType')} value={vm.appointmentType || t('notSelected')} />
										<SummaryItem label={t('preferredDate')} value={vm.preferredDate || t('notSelected')} />
										<SummaryItem label={t('preferredTime')} value={vm.preferredTime || t('notSelected')} />
										<SummaryItem
											label={t('notesLabel')}
											value={vm.notes ? vm.notes : t('none')}
											full
										/>
									</div>
								</div>
							)}
						</div>

						{/* Nav buttons */}
						<div className="flex items-center justify-between flex-wrap gap-3">
							<button
								type="button"
								onClick={handleBack}
								disabled={step === 0}
								className="px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-700 hover:border-purple-300 hover:text-purple-700 disabled:opacity-40"
							>
								{t('back') || 'Back'}
							</button>

							{step < steps.length - 1 && (
								<button
									type="button"
									onClick={handleNext}
									disabled={!canGoNext()}
									className="px-6 py-2 rounded-full bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{t('continue') || 'Continue'}
								</button>
							)}

							{step === steps.length - 1 && (
								<button
									className="px-6 py-2 rounded-full bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 transition disabled:opacity-60"
									type="submit"
									disabled={!vm.canSubmit || vm.isSubmitting}
								>
									{vm.isSubmitting ? t('booking') : t('confirm')}
								</button>
							)}
						</div>
					</div>

					{/* Side summary / reassurance */}
					<div className="space-y-4">
						<div className="bg-white rounded-3xl border border-purple-50 shadow-lg p-6 space-y-4">
							<h3 className="text-base font-semibold text-gray-900">{t('appointmentSummary') || 'Appointment summary'}</h3>
							{!vm.hasSummaryContent ? (
								<p className="text-sm text-gray-500">
									{t('appointmentSummaryEmpty') || 'Start by selecting a doctor and time. We will recap here.'}
								</p>
							) : (
								<div className="space-y-3 text-sm text-gray-800">
									<SummaryItem label={t('doctor')} value={vm.selectedDoctor?.name} helper={vm.selectedDoctor?.specialization} />
									<SummaryItem label={t('appointmentType')} value={vm.appointmentType} />
									<SummaryItem label={t('preferredDate')} value={vm.preferredDate} />
									<SummaryItem label={t('preferredTime')} value={vm.preferredTime} />
									{vm.notes && <SummaryItem label={t('notesLabel')} value={vm.notes} full />}
								</div>
							)}
						</div>

						<div className="bg-gradient-to-br from-purple-600 to-purple-500 text-white rounded-3xl p-5 shadow-lg">
							<p className="text-sm font-semibold">{t('carePromiseTitle') || 'Designed for calm care'}</p>
							<ul className="mt-3 space-y-2 text-sm text-purple-50">
								<li>• {t('carePromise1') || 'HIPAA-aware practices and secure sessions.'}</li>
								<li>• {t('carePromise2') || 'Clear next steps and reminders by email.'}</li>
								<li>• {t('carePromise3') || 'Human support if you need help scheduling.'}</li>
							</ul>
						</div>
					</div>
				</form>
			</div>

			{/* Confirmation Modal */}
			{vm.showModal && <AppointmentConfirmation onClose={vm.handleCloseModal} />}
		</div>
	);
}

function SummaryItem({
	label,
	value,
	helper,
	full,
}: {
	label: string | undefined;
	value?: string | null;
	helper?: string | null;
	full?: boolean;
}) {
	return (
		<div className={`${full ? 'md:col-span-2' : ''}`}>
			<p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
			<p className="font-semibold text-gray-900">{value || '—'}</p>
			{helper && <p className="text-xs text-gray-500">{helper}</p>}
		</div>
	);
}
