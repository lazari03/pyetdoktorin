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

const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
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

	const sortedAppointments =
		appointments && appointments.length > 0
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
			{/* Desktop Table */}
			<div className="overflow-x-auto mt-4 hidden md:block">
				<table className="w-full text-sm md:text-base border-separate border-spacing-0">
					<thead>
						<tr className="text-left text-gray-500 text-xs font-medium">
							<th className="py-3 px-4 border-b border-gray-200">{t('date')}</th>
							<th className="py-3 px-4 border-b border-gray-200">
								{role === 'doctor' ? t('patient') : t('doctor')}
							</th>
							<th className="py-3 px-4 border-b border-gray-200">{t('type')}</th>
							<th className="py-3 px-4 border-b border-gray-200">{t('time')}</th>
							<th className="py-3 px-4 border-b border-gray-200">{t('notes')}</th>
							<th className="py-3 px-4 border-b border-gray-200">{t('status')}</th>
							{showActions && (
								<th className="py-3 px-4 border-b border-gray-200 text-right">
									{t('actions')}
								</th>
							)}
						</tr>
					</thead>
					<tbody>
						{sortedAppointments.length > 0 ? (
							sortedAppointments.map((appointment, index) => {
								// Helper to map string to UserRole enum
								const toUserRole = (r: string): UserRole | undefined => {
									return Object.values(UserRole).includes(r as UserRole)
										? (r as UserRole)
										: undefined;
								};
								const userRoleEnum = toUserRole(role);
								const action = getAppointmentAction(appointment, isAppointmentPast, userRoleEnum);

								const isLastRow = index === sortedAppointments.length - 1;

								return (
									<tr key={appointment.id} className="text-gray-900 text-sm align-middle">
										<td
											className={`py-4 px-4 ${
												isLastRow ? '' : 'border-b border-gray-100'
											}`}
										>
											{appointment.preferredDate}
										</td>
										<td
											className={`py-4 px-4 ${
												isLastRow ? '' : 'border-b border-gray-100'
											}`}
										>
											{role === 'doctor'
												? appointment.patientName || 'N/A'
												: (
													<a
														href={`/dashboard/doctor/${appointment.doctorId}`}
														className="text-orange-500 font-medium hover:text-orange-600"
													>
														{appointment.doctorName}
													</a>
												)}
										</td>
										<td
											className={`py-4 px-4 ${
												isLastRow ? '' : 'border-b border-gray-100'
											}`}
										>
											{appointment.appointmentType}
										</td>
										<td
											className={`py-4 px-4 ${
												isLastRow ? '' : 'border-b border-gray-100'
											}`}
										>
											{appointment.preferredTime}
										</td>
										<td
											className={`py-4 px-4 ${
												isLastRow ? '' : 'border-b border-gray-100'
											}`}
										>
											{appointment.notes}
										</td>
										<td
											className={`py-4 px-4 ${
												isLastRow ? '' : 'border-b border-gray-100'
											}`}
										>
											{appointment.status === 'accepted' ? (
												<span className="text-emerald-500 text-sm font-semibold">
													{t('accepted')}
												</span>
											) : appointment.status === 'rejected' ? (
												<span className="text-red-500 text-sm font-semibold">
													{t('declined')}
												</span>
											) : appointment.status === 'pending' ? (
												<span className="text-gray-500 text-sm font-semibold">
													{t('pending')}
												</span>
											) : (
												<span className="text-amber-500 text-sm font-semibold">
													{appointment.status}
												</span>
											)}
										</td>
										{showActions && (
											<td
												className={`py-4 px-4 ${
													isLastRow ? '' : 'border-b border-gray-100'
												} text-right space-x-2`}
											>
												{role !== 'doctor' && action.label === 'Pay Now' && !action.disabled && (
													<button
														className="inline-flex items-center rounded-full border border-orange-500 px-4 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-500 hover:text-white transition-colors"
														onClick={() => handlePayNow(appointment.id, DEFAULT_APPOINTMENT_PAYMENT_AMOUNT)}
													>
														{t('payNow')}
													</button>
												)}
												{action.label === 'Join Now' && !action.disabled && (
													<button
														className="inline-flex items-center rounded-full bg-orange-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 transition-colors"
														onClick={() => handleJoinCall(appointment.id)}
													>
														{t('joinNow')}
													</button>
												)}
												{action.disabled && role === 'doctor' && (
													<span className="text-orange-500 text-xs font-semibold">
														{t('waitingForPayment')}
													</span>
												)}
												{action.disabled && role !== 'doctor' && (
													<button
														className="inline-flex items-center rounded-full bg-gray-300 px-4 py-1.5 text-xs font-semibold text-gray-600 cursor-not-allowed opacity-70"
														disabled
													>
														{action.label}
													</button>
												)}
											</td>
										)}
									</tr>
								);
							})
						) : (
							<tr>
								<td
									colSpan={showActions ? 7 : 6}
									className="py-6 px-4 text-center text-sm text-gray-500"
								>
									{t('noAppointmentsFound')}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* TODO: mobile/tablet stacked view can be themed similarly later */}
		</>
	);
};

export default AppointmentsTable;