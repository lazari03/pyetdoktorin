'use client';
import { useTranslation } from 'react-i18next';
import DoctorSearch from '@/presentation/components/doctor/DoctorSearch';
import AppointmentConfirmation from './AppointmentConfirmation';

import { useNewAppointmentViewModel } from '@/presentation/view-models/useNewAppointmentViewModel';
import { useState } from 'react';
import { APPOINTMENT_PRICE_CURRENCY, APPOINTMENT_PRICE_EUR } from '@/config/paywallConfig';

export default function NewAppointmentStepper() {
	const { t } = useTranslation();
	const vm = useNewAppointmentViewModel();
	const steps = [
		{ key: 'who', title: t('stepWhoFor') || 'Who is this for?' },
		{ key: 'doctor', title: t('stepChooseDoctor') },
		{ key: 'schedule', title: t('stepSchedule') },
		{ key: 'details', title: t('stepDetails') },
		{ key: 'review', title: t('stepReview') },
	] as const;
	const [step, setStep] = useState(0);

	const canGoNext = () => {
		if (step === 0) return !!vm.bookingFor;
		if (step === 1) return !!vm.selectedDoctor;
		if (step === 2) return !!(vm.appointmentType && vm.preferredDate && vm.preferredTime);
		return true;
	};

	const handleNext = () => {
		if (step < steps.length - 1 && canGoNext()) setStep(step + 1);
	};

	const handleBack = () => {
		if (step > 0) setStep(step - 1);
	};

	return (
		<div className="mx-auto max-w-5xl px-4 py-4 sm:py-6 space-y-4">
			{/* Header & subtitle */}
			<div className="flex items-start justify-between flex-wrap gap-4">
				<div>
					<p className="text-[10px] font-bold uppercase tracking-[.13em] text-purple-600">
						{t('bookingFlowEyebrow') || 'Telehealth'}
					</p>
					<h1 className="text-[15px] font-bold text-gray-900 mt-1">
						{t('bookingFlowTitle') || 'Book your visit'}
					</h1>
					<p className="text-[12.5px] text-gray-500">
						{t('bookingFlowSubtitle') || 'Follow the guided steps. No surprises, just care.'}
					</p>
				</div>
				<div className="bg-white rounded-xl border border-gray-100 shadow-sm px-3 py-2 text-xs text-gray-600">
					{t('bookingSecureNotice') || 'Your health information is protected and never shared.'}
				</div>
			</div>

			{/* Step indicator */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
					{steps.map((s, idx) => {
						const active = idx === step;
						const done = idx < step;
						return (
							<div
								key={s.key}
								className={`flex items-center gap-2 sm:gap-3 rounded-xl border px-2.5 sm:px-3 py-2.5 text-sm shadow-sm min-w-0 ${
									active
										? 'border-purple-200 bg-white'
										: 'border-gray-100 bg-white'
								}`}
							>
								<div
									className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-[12.5px] font-bold ${
										done
											? 'bg-green-100 text-green-700'
											: active
											? 'bg-purple-600 text-white'
											: 'bg-gray-100 text-gray-400'
									}`}
								>
									{done ? '✓' : idx + 1}
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-[10px] font-bold uppercase tracking-[.08em] text-gray-400 truncate">
										{t('stepLabel', { current: idx + 1, total: steps.length }) || `Step ${idx + 1}`}
									</p>
									<p className="text-[12.5px] font-semibold text-gray-900 truncate">{s.title}</p>
								</div>
							</div>
						);
					})}
				</div>

				<form onSubmit={vm.handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-w-0">
					{/* Main panel */}
					<div className="lg:col-span-2 space-y-4 min-w-0">
						<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-5">
							{vm.submitError && (
								<div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
									{vm.submitError}
								</div>
							)}
							{step === 0 && (
								<div className="space-y-3">
									<h2 className="text-lg font-semibold text-gray-900">{t('stepWhoFor') || 'Who is this for?'}</h2>
									<p className="text-sm text-gray-600">
										{t('stepWhoForDescription') ||
											'Book for yourself, or for a family member you manage.'}
									</p>
									<div className="grid gap-2 sm:grid-cols-2">
										<button
											type="button"
											onClick={() => vm.setBookingFor('self')}
											className={`text-left rounded-xl border px-4 py-3 transition-colors ${
												vm.bookingFor === 'self'
													? 'border-purple-400 bg-purple-50'
													: 'border-gray-200 bg-white hover:border-purple-200'
											}`}
										>
											<p className="text-sm font-semibold text-gray-900">{t('bookingForMyself') || 'Myself'}</p>
										</button>
										{vm.familyMembers.map((member) => (
											<button
												key={member.id}
												type="button"
												onClick={() => vm.setBookingFor(member.id)}
												className={`text-left rounded-xl border px-4 py-3 transition-colors ${
													vm.bookingFor === member.id
														? 'border-purple-400 bg-purple-50'
														: 'border-gray-200 bg-white hover:border-purple-200'
												}`}
											>
												<p className="text-sm font-semibold text-gray-900">{member.name}</p>
												<p className="text-xs text-gray-500 capitalize">{member.relationship}</p>
											</button>
										))}
									</div>
									{vm.familyMembers.length === 0 && (
										<p className="text-xs text-gray-500">
											{t('bookingForNoFamily') ||
												'No family members yet. Add them from your profile settings to book on their behalf.'}
										</p>
									)}
								</div>
							)}

							{step === 1 && (
								<div className="space-y-3">
									<h2 className="text-lg font-semibold text-gray-900">{t('selectDoctor')}</h2>
									<p className="text-sm text-gray-600">
										{t('selectDoctorDescription') ||
											'Search for the clinician you trust. We highlight availability for you.'}
									</p>
									<DoctorSearch
										onDoctorSelect={vm.handleDoctorSelect}
										selectedDoctor={vm.selectedDoctor ?? undefined}
										onClearSelection={vm.clearSelectedDoctor}
									/>
								</div>
							)}

							{step === 2 && (
								<div className="space-y-4">
									<div>
										<h2 className="text-lg font-semibold text-gray-900">{t('chooseDateAndTime')}</h2>
										<p className="text-sm text-gray-600">
											{t('chooseDateAndTimeDescription') ||
												'Pick a date, then choose a time that fits your day.'}
										</p>
									</div>

									<div>
										<label className="block text-sm font-medium mb-1.5 text-gray-700">
											{t('appointmentType')}
										</label>
										<div className="flex flex-wrap gap-2">
											{[
												{ value: 'Consultation', label: t('consultation') },
												{ value: 'Check-up', label: t('checkUp') },
												{ value: 'Follow-up', label: t('followUp') },
											].map((option) => {
												const selected = vm.appointmentType === option.value;
												return (
													<button
														key={option.value}
														type="button"
														onClick={() => vm.setAppointmentType(option.value)}
														className={`rounded-lg px-3.5 py-2 text-[12.5px] font-semibold border transition-colors ${
															selected
																? 'border-purple-400 bg-purple-50 text-purple-700'
																: 'border-gray-200 bg-white text-gray-600 hover:border-purple-200'
														}`}
													>
														{option.label}
													</button>
												);
											})}
										</div>
									</div>

									<div className="grid md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium mb-1 text-gray-700">
												{t('preferredDate')}
											</label>
											<input
												type="date"
												className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-white"
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
											{vm.availabilityLoading && (
												<div className="mb-2 text-xs text-teal-700">
													{t('checkingAvailability') || 'Checking live availability...'}
												</div>
											)}
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

							{step === 3 && (
								<div className="space-y-3">
									<h2 className="text-lg font-semibold text-gray-900">{t('visitDetails')}</h2>
									<p className="text-sm text-gray-600">
										{t('addNotesOptional') || 'Share any symptoms or goals. Optional but helpful for your doctor.'}
									</p>
									<textarea
										className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-white min-h-[140px]"
										rows={4}
										value={vm.notes}
										onChange={(e) => vm.setNotes(e.target.value)}
										placeholder={t('notesPlaceholder')}
									></textarea>
								</div>
							)}

							{step === 4 && (
								<div className="space-y-4">
									<h2 className="text-lg font-semibold text-gray-900">{t('reviewConfirm')}</h2>
									<p className="text-sm text-gray-600">{t('readyToConfirm') || 'Review the details before we reserve your slot.'}</p>
									<div className="grid md:grid-cols-2 gap-3">
										<SummaryItem
											label={t('appointmentFor') || 'Appointment for'}
											value={vm.bookingFor === 'self' ? t('bookingForMyself') || 'Myself' : vm.familyMembers.find((m) => m.id === vm.bookingFor)?.name || t('notSelected')}
											boxed
										/>
										<SummaryItem label={t('doctor')} value={vm.selectedDoctor?.name || t('notSelected')} helper={vm.selectedDoctor?.specialization} boxed />
										<SummaryItem label={t('appointmentType')} value={vm.appointmentType || t('notSelected')} boxed />
										<SummaryItem label={t('preferredDate')} value={vm.preferredDate || t('notSelected')} boxed />
										<SummaryItem label={t('preferredTime')} value={vm.preferredTime || t('notSelected')} boxed />
										<SummaryItem
											label={t('notesLabel')}
											value={vm.notes ? vm.notes : t('none')}
											full
											boxed
										/>
									</div>
									<div className="flex items-center justify-between rounded-xl bg-purple-50 border border-purple-100 px-4 py-3">
										<span className="text-[12.5px] font-semibold text-purple-800">
											{t('consultationFee') || 'Consultation fee'}
										</span>
										<span className="text-base font-extrabold text-purple-800">
											{APPOINTMENT_PRICE_CURRENCY} {APPOINTMENT_PRICE_EUR.toFixed(2)}
										</span>
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
					<div className="space-y-4 min-w-0">
						<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
							<h3 className="text-[13.5px] font-bold text-gray-900">{t('appointmentSummary') || 'Appointment summary'}</h3>
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

						<div className="bg-gradient-to-br from-purple-600 to-purple-500 text-white rounded-xl p-5 shadow-sm">
							<p className="text-[12.5px] font-bold">{t('carePromiseTitle') || 'Designed for calm care'}</p>
							<ul className="mt-3 space-y-2 text-[12px] text-purple-50">
								<li>• {t('carePromise1') || 'HIPAA-aware practices and secure sessions.'}</li>
								<li>• {t('carePromise2') || 'Clear next steps and reminders by email.'}</li>
								<li>• {t('carePromise3') || 'Human support if you need help scheduling.'}</li>
							</ul>
						</div>
					</div>
				</form>

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
	boxed,
}: {
	label: string | undefined;
	value?: string | null;
	helper?: string | null;
	full?: boolean;
	boxed?: boolean;
}) {
	return (
		<div className={`${full ? 'md:col-span-2' : ''} ${boxed ? 'rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5' : ''}`}>
			<p className="text-[10px] font-bold uppercase tracking-[.06em] text-gray-400">{label}</p>
			<p className="text-[13px] font-semibold text-gray-900 mt-0.5">{value || '—'}</p>
			{helper && <p className="text-[11.5px] text-gray-500">{helper}</p>}
		</div>
	);
}
