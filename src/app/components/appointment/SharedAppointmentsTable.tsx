import React from 'react';
import { useTranslation } from 'react-i18next';
import CenteredLoader from '../CenteredLoader';
import { Appointment } from '@/domain/entities/Appointment';
import { UserRole } from '@/domain/entities/UserRole';
import { getAppointmentAction } from '@/domain/appointmentActionButton';
import { DEFAULT_APPOINTMENT_PAYMENT_AMOUNT } from '@/config/paymentConfig';

interface AppointmentsTableProps {
	appointments: Appointment[];
	role: string;
	isAppointmentPast: (appointment: Appointment) => boolean;
	handleJoinCall: (appointmentId: string) => void;
	handlePayNow: (appointmentId: string, amount: number) => void;
	showActions?: boolean;
	maxRows?: number;
	loading?: boolean;
}

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
	appointments,
	role,
	isAppointmentPast,
	handleJoinCall,
	handlePayNow,
	showActions = true,
	maxRows = 3,
	loading = false,
}) => {
	const { t } = useTranslation();
  
	if (loading) {
		return <CenteredLoader />;
	}

	// Common sorted + sliced list
	const sortedAppointments = appointments && appointments.length > 0
		? [...appointments]
			.sort((a, b) => {
				const dateA = new Date(a.preferredDate).getTime();
				const dateB = new Date(b.preferredDate).getTime();
				if (dateA !== dateB) return dateB - dateA;
				const createdAtA = new Date(a.createdAt).getTime();
				const createdAtB = new Date(b.createdAt).getTime();
				return createdAtB - createdAtA;
			})
			.slice(0, maxRows)
		: [];

	return (
		<>
			{/* Desktop: card-per-row layout */}
			<div className="hidden md:block mt-4 space-y-3">
				{sortedAppointments.length > 0 ? (
						sortedAppointments.map((appointment) => {
							// Helper to map string to UserRole enum
							const toUserRole = (r: string): UserRole | undefined => {
								return Object.values(UserRole).includes(r as UserRole)
									? (r as UserRole)
									: undefined;
							};
							const userRoleEnum = toUserRole(role);
							const action = getAppointmentAction(appointment, isAppointmentPast, userRoleEnum);

							return (
								<div
									key={appointment.id}
									className="rounded-xl border border-gray-100 bg-white px-4 py-3 flex items-center gap-4 text-xs sm:text-sm shadow-sm"
								>
									{/* Left: date & time */}
									<div className="min-w-[5.5rem] flex flex-col">
										<span className="font-semibold text-gray-900 whitespace-nowrap">
											{appointment.preferredDate}
										</span>
										<span className="text-[11px] text-gray-500 whitespace-nowrap">
											{appointment.preferredTime}
										</span>
									</div>

									{/* Middle: names, type, notes */}
									<div className="flex-1 flex flex-col gap-1 min-w-0">
										<div className="flex flex-wrap items-center gap-x-4 gap-y-1">
											<span className="text-gray-800">
												<span className="font-medium">
													{role === 'doctor' ? t('patientColon') : t('doctorColon')}
												</span>{' '}
												{role === 'doctor'
													? appointment.patientName || 'N/A'
													: (
														<a
															href={`/dashboard/doctor/${appointment.doctorId}`}
															className="text-indigo-500 hover:text-indigo-600 underline underline-offset-2"
														>
															{appointment.doctorName}
														</a>
													)}
											</span>
											<span className="text-gray-700">
												<span className="font-medium">{t('typeColon')}</span>{' '}
												{appointment.appointmentType}
											</span>
										</div>
										<div className="text-[11px] sm:text-xs text-gray-600 truncate">
											<span className="font-medium">{t('notesColon')}</span>{' '}
											{appointment.notes}
										</div>
									</div>

									{/* Right: status + actions */}
									<div className="flex items-center gap-2 self-start ml-auto">
										<span
											className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${
												appointment.status === 'accepted'
													? 'bg-emerald-100 text-emerald-700'
													: appointment.status === 'rejected'
													? 'bg-red-100 text-red-600'
													: appointment.status === 'pending'
													? 'bg-gray-100 text-gray-600'
													: 'bg-amber-100 text-amber-700'
											}`}
										>
											{appointment.status === 'accepted'
													? t('accepted')
													: appointment.status === 'rejected'
													? t('declined')
													: appointment.status === 'pending'
													? t('pending')
													: appointment.status}
										</span>
										{showActions && (
											<div className="flex items-center gap-2">
												{role !== 'doctor' && action.label === 'Pay Now' && !action.disabled && (
													<button
														className="inline-flex items-center rounded-full border border-orange-400 px-3 py-1 text-[11px] font-medium text-orange-600 hover:bg-orange-500 hover:text-white transition-colors"
														onClick={() => handlePayNow(appointment.id, DEFAULT_APPOINTMENT_PAYMENT_AMOUNT)}
													>
														{t('payNow')}
													</button>
												)}
												{action.label === 'Join Now' && !action.disabled && (
													<button
														className="inline-flex items-center rounded-full bg-black px-3 py-1 text-[11px] font-semibold text-white hover:bg-gray-900 transition-colors"
														onClick={() => handleJoinCall(appointment.id)}
													>
														{t('joinNow')}
													</button>
												)}
												{action.disabled && role === 'doctor' && (
													<span className="text-[11px] font-medium text-orange-500">
														{t('waitingForPayment')}
													</span>
												)}
												{action.disabled && role !== 'doctor' && (
													<button
														className="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-[11px] font-medium text-gray-400 cursor-not-allowed"
														disabled
													>
														{action.label}
													</button>
												)}
											</div>
										)}
									</div>
								</div>
							);
						})
				) : (
						<div className="text-center text-xs text-gray-500 py-4">
							{t('noAppointmentsFound')}
						</div>
				)}
			</div>

			{/* Mobile Card List (kept, slightly tuned) */}
			<div className="block md:hidden mt-4 space-y-4">
				{sortedAppointments.length > 0 ? (
						sortedAppointments.map((appointment) => {
							const action = getAppointmentAction(appointment, isAppointmentPast, role as UserRole);
							return (
								<div key={appointment.id} className="rounded-2xl border border-gray-100 bg-white p-4 flex flex-col gap-2 shadow-sm">
									<div className="flex justify-between items-center">
										<span className="font-semibold text-gray-900 text-sm">{appointment.preferredDate}</span>
										<span className="text-[11px] text-gray-500">{appointment.preferredTime}</span>
									</div>
									<div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-700">
										<span>
											<span className="font-medium">{role === 'doctor' ? t('patientColon') : t('doctorColon')}</span>{' '}
											{role === 'doctor' ? appointment.patientName || 'N/A' : appointment.doctorName}
										</span>
										<span>
											<span className="font-medium">{t('typeColon')}</span>{' '}
											{appointment.appointmentType}
										</span>
									</div>
									<div className="text-[11px] text-gray-600">
										<span className="font-medium">{t('notesColon')}</span>{' '}
										{appointment.notes}
									</div>
									<div className="flex items-center gap-2 mt-1">
										<span
											className={
												appointment.status === 'accepted'
													? 'inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700'
												: appointment.status === 'rejected'
													? 'inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600'
													: appointment.status === 'pending'
													? 'inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600'
													: 'inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700'
											}
										>
											{appointment.status === 'accepted'
													? t('accepted')
													: appointment.status === 'rejected'
													? t('declined')
													: appointment.status === 'pending'
													? t('pending')
													: appointment.status}
										</span>
										{showActions && (
											<>
												{role !== 'doctor' && action.label === 'Pay Now' && !action.disabled && (
													<button
														className="ml-auto inline-flex items-center rounded-full border border-orange-400 px-3 py-1 text-[10px] font-medium text-orange-600 hover:bg-orange-500 hover:text-white transition-colors"
														onClick={() => handlePayNow(appointment.id, DEFAULT_APPOINTMENT_PAYMENT_AMOUNT)}
													>
														{t('payNow')}
													</button>
												)}
												{action.label === 'Join Now' && !action.disabled && (
													<button
														className="ml-auto inline-flex items-center rounded-full bg-black px-3 py-1 text-[10px] font-semibold text-white hover:bg-gray-900 transition-colors"
														onClick={() => handleJoinCall(appointment.id)}
													>
														{t('joinNow')}
													</button>
												)}
												{action.disabled && role === 'doctor' && (
													<span className="ml-2 text-[10px] font-medium text-orange-500">
														{t('waitingForPayment')}
													</span>
												)}
												{action.disabled && role !== 'doctor' && (
													<button
														className="ml-auto inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-[10px] font-medium text-gray-400 cursor-not-allowed"
														disabled
													>
														{action.label}
													</button>
												)}
											</>
										)}
									</div>
								</div>
							);
						})
				) : (
						<div className="text-center text-xs text-gray-500">{t('noAppointmentsFound')}</div>
					)}
				</div>
		</>
	);
};