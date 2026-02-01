import React from 'react';
import { useTranslation } from 'react-i18next';
import CenteredLoader from '@/presentation/components/CenteredLoader/CenteredLoader';
import { getAppointmentAction } from '@/presentation/utils/getAppointmentAction';
import { getAppointmentActionPresentation } from '@/presentation/utils/getAppointmentActionPresentation';
import { sortAppointments } from '@/presentation/utils/sortAppointments';
import { toUserRole } from '@/presentation/utils/toUserRole';
import { PAYWALL_AMOUNT_USD } from '@/config/paywallConfig';
import { getAppointmentStatusPresentation } from '@/presentation/utils/getAppointmentStatusPresentation';
import { AppointmentsTableProps } from './types';
import { Appointment } from '@/domain/entities/Appointment';
import { PhoneIcon, CreditCardIcon } from '@heroicons/react/24/outline';

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
			<span className="text-purple-500 text-xs font-semibold">{t(presentation.label)}</span>
		);
	}

	if (presentation.type === 'join') {
		return (
			<button
				className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white transition-colors"
				onClick={() => onJoinCall(appointment.id)}
			>
				<PhoneIcon className="h-4 w-4" aria-hidden />
				<span className="sr-only">{t(presentation.label)}</span>
			</button>
		);
	}

	if (presentation.type === 'pay') {
		return (
			<button
				className="inline-flex items-center gap-2 rounded-full border-2 border-purple-300 px-3.5 py-1.5 text-xs font-semibold text-purple-600 hover:bg-purple-500 hover:text-white transition-colors whitespace-nowrap"
				onClick={() => onPayNow(appointment.id, PAYWALL_AMOUNT_USD)}
			>
				<CreditCardIcon className="h-4 w-4" aria-hidden />
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
	variant = 'default',
}) => {
	const { t } = useTranslation();
	const isMinimal = variant === 'minimal';

	const containerClass = isMinimal
		? 'mt-2 rounded-2xl border border-gray-200/70 bg-white shadow-sm overflow-hidden'
		: 'mt-4';
	const headerRowClass = isMinimal
		? 'flex items-center text-left text-gray-600 text-[11px] tracking-[0.08em] uppercase bg-gray-50/90 border-b border-gray-200'
		: 'flex items-center text-left text-gray-500 text-xs font-medium border-b border-gray-200 pb-3';
	const bodyWrapperClass = isMinimal ? '' : 'divide-y divide-gray-100';
	const rowClass = isMinimal
		? 'flex items-center text-gray-900 text-sm py-4 hover:bg-gray-50/80 border-b border-gray-100 last:border-b-0'
		: 'flex items-center text-gray-900 text-sm py-4';

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
		<div className={containerClass}>
			{/* Desktop Grid View */}
			<div className="hidden md:block">
				{/* Header */}
				<div className={headerRowClass}>
					{headers.map((header, idx) => (
						<div
							key={header.key}
							className={`px-4 py-3 ${header.width} ${idx === headers.length - 1 && showActions ? 'text-right' : ''}`}
						>
							{header.label}
						</div>
					))}
				</div>

				{/* Body */}
				<div className={bodyWrapperClass}>
					{sortedAppointments.length > 0 ? (
						sortedAppointments.map((appointment) => {
							const action = getAppointmentAction(appointment, isAppointmentPast, toUserRole(role));

							return (
								<div key={appointment.id} className={rowClass}>
									<div className="px-4 w-[12%]">{appointment.preferredDate}</div>
									<div className="px-4 w-[15%]">
										{isDoctor ? (
											appointment.patientName || 'N/A'
										) : (
											<a
												href={`/dashboard/doctor/${appointment.doctorId}`}
												className="text-purple-500 font-medium hover:text-purple-600"
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
							<div
								key={appointment.id}
								className={`${
									isMinimal
										? 'bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3'
										: 'bg-white rounded-lg border border-gray-200 p-4 space-y-3'
								}`}
							>
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
													className="text-purple-500 font-medium hover:text-purple-600"
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
