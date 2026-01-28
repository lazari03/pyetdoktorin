import React from 'react';
import { useTranslation } from 'react-i18next';
import CenteredLoader from '@/presentation/components/CenteredLoader/CenteredLoader';
import { getAppointmentAction } from '@/presentation/utils/getAppointmentAction';
import { getAppointmentActionPresentation } from '@/presentation/utils/getAppointmentActionPresentation';
import { sortAppointments } from '@/presentation/utils/sortAppointments';
import { toUserRole } from '@/presentation/utils/toUserRole';
import { DEFAULT_APPOINTMENT_PAYMENT_AMOUNT } from '@/config/paymentConfig';
import { getAppointmentStatusPresentation } from '@/presentation/utils/getAppointmentStatusPresentation';
import { AppointmentsTableProps } from './types';
import { Appointment } from '@/domain/entities/Appointment';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
	const { t } = useTranslation();
	const { color, label } = getAppointmentStatusPresentation(status);
	return <span className={`${color} text-sm font-semibold`}>{t(label)}</span>;
};

const ActionButtons: React.FC<{
	appointment: Appointment;
	role: string;
	action: { label: string; disabled: boolean };
	onJoinCall: (id: string) => void;
	onPayNow: (id: string, amount: number) => void;
}> = ({ appointment, role, action, onJoinCall, onPayNow }) => {
	const { t } = useTranslation();
	const presentation = getAppointmentActionPresentation(appointment, role, action);

	if (presentation.type === 'disabled') {
		return (
			<button className="inline-flex items-center rounded-full bg-gray-300 px-4 py-1.5 text-xs font-semibold text-gray-600 cursor-not-allowed opacity-70" disabled>
				{t(presentation.label)}
			</button>
		);
	}

	if (presentation.type === 'waiting') {
		return (
			<span className="text-orange-500 text-xs font-semibold">{t(presentation.label)}</span>
		);
	}

	if (presentation.type === 'join') {
		return (
			<button
				className="inline-flex items-center rounded-full bg-orange-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 transition-colors"
				onClick={() => onJoinCall(appointment.id)}
			>
				{t(presentation.label)}
			</button>
		);
	}

	if (presentation.type === 'pay') {
		return (
			<button
				className="inline-flex items-center rounded-full border border-purple-500 px-4 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-500 hover:text-white transition-colors"
				onClick={() => onPayNow(appointment.id, DEFAULT_APPOINTMENT_PAYMENT_AMOUNT)}
			>
				{t(presentation.label)}
			</button>
		);
	}

	return null;
};

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

	if (loading) return <CenteredLoader />;

	const sortedAppointments = appointments?.length > 0 ? sortAppointments(appointments, maxRows) : [];
	const isDoctor = role === 'doctor';

	const headers = [
		{ key: 'date', label: t('date'), width: 'w-[12%]' },
		{ key: 'person', label: isDoctor ? t('patient') : t('doctor'), width: 'w-[15%]' },
		{ key: 'type', label: t('type'), width: 'w-[12%]' },
		{ key: 'time', label: t('time'), width: 'w-[10%]' },
		{ key: 'notes', label: t('notes'), width: 'w-[25%]' },
		{ key: 'status', label: t('status'), width: 'w-[12%]' },
		...(showActions ? [{ key: 'actions', label: t('actions'), width: 'w-[14%]' }] : [])
	];

	return (
		<div className="mt-4">
			{/* Desktop Grid View */}
			<div className="hidden md:block">
				{/* Header */}
				<div className="flex items-center text-left text-gray-500 text-xs font-medium border-b border-gray-200 pb-3">
					{headers.map((header, idx) => (
						<div
							key={header.key}
							className={`px-4 ${header.width} ${idx === headers.length - 1 && showActions ? 'text-right' : ''}`}
						>
							{header.label}
						</div>
					))}
				</div>

				{/* Body */}
				<div className="divide-y divide-gray-100">
					{sortedAppointments.length > 0 ? (
						sortedAppointments.map((appointment) => {
							const action = getAppointmentAction(appointment, isAppointmentPast, toUserRole(role));

							return (
								<div key={appointment.id} className="flex items-center text-gray-900 text-sm py-4">
									<div className="px-4 w-[12%]">{appointment.preferredDate}</div>
									<div className="px-4 w-[15%]">
										{isDoctor ? (
											appointment.patientName || 'N/A'
										) : (
											<a
												href={`/dashboard/doctor/${appointment.doctorId}`}
												className="text-orange-500 font-medium hover:text-orange-600"
											>
												{appointment.doctorName}
											</a>
										)}
									</div>
									<div className="px-4 w-[12%]">{appointment.appointmentType}</div>
									<div className="px-4 w-[10%]">{appointment.preferredTime}</div>
									<div className="px-4 w-[25%]">{appointment.notes}</div>
									<div className="px-4 w-[12%]">
										<StatusBadge status={appointment.status} />
									</div>
									{showActions && (
										<div className="px-4 w-[14%] text-right space-x-2">
											<ActionButtons
												appointment={appointment}
												role={role}
												action={action}
												onJoinCall={handleJoinCall}
												onPayNow={handlePayNow}
											/>
										</div>
									)}
								</div>
							);
						})
					) : (
						<div className="py-6 px-4 text-center text-sm text-gray-500">
							{t('noAppointmentsFound')}
						</div>
					)}
				</div>
			</div>

			{/* Mobile Card View */}
			<div className="md:hidden space-y-4">
				{sortedAppointments.length > 0 ? (
					sortedAppointments.map((appointment) => {
						const action = getAppointmentAction(appointment, isAppointmentPast, toUserRole(role));

						return (
							<div key={appointment.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
								<div className="flex justify-between items-start">
									<div>
										<div className="text-xs text-gray-500 mb-1">{t('date')}</div>
										<div className="text-sm font-medium text-gray-900">{appointment.preferredDate}</div>
									</div>
									<StatusBadge status={appointment.status} />
								</div>

								<div className="grid grid-cols-2 gap-3">
									<div>
										<div className="text-xs text-gray-500 mb-1">{isDoctor ? t('patient') : t('doctor')}</div>
										<div className="text-sm text-gray-900">
											{isDoctor ? (
												appointment.patientName || 'N/A'
											) : (
												<a
													href={`/dashboard/doctor/${appointment.doctorId}`}
													className="text-orange-500 font-medium hover:text-orange-600"
												>
													{appointment.doctorName}
												</a>
											)}
										</div>
									</div>
									<div>
										<div className="text-xs text-gray-500 mb-1">{t('time')}</div>
										<div className="text-sm text-gray-900">{appointment.preferredTime}</div>
									</div>
								</div>

								<div>
									<div className="text-xs text-gray-500 mb-1">{t('type')}</div>
									<div className="text-sm text-gray-900">{appointment.appointmentType}</div>
								</div>

								{appointment.notes && (
									<div>
										<div className="text-xs text-gray-500 mb-1">{t('notes')}</div>
										<div className="text-sm text-gray-900">{appointment.notes}</div>
									</div>
								)}

								{showActions && (
									<div className="pt-2 flex justify-end">
										<ActionButtons
											appointment={appointment}
											role={role}
											action={action}
											onJoinCall={handleJoinCall}
											onPayNow={handlePayNow}
										/>
									</div>
								)}
							</div>
						);
					})
				) : (
					<div className="py-6 px-4 text-center text-sm text-gray-500 bg-white rounded-lg border border-gray-200">
						{t('noAppointmentsFound')}
					</div>
				)}
			</div>
		</div>
	);
};

export default AppointmentsTable;
