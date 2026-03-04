import React from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '@/presentation/components/Loader/Loader';
import { getAppointmentAction } from '@/presentation/utils/getAppointmentAction';
import { getAppointmentActionPresentation } from '@/presentation/utils/getAppointmentActionPresentation';
import { sortAppointments } from '@/presentation/utils/sortAppointments';
import { toUserRole } from '@/presentation/utils/toUserRole';
import { PAYWALL_AMOUNT_USD } from '@/config/paywallConfig';
import { getAppointmentStatusPresentation } from '@/presentation/utils/getAppointmentStatusPresentation';
import { AppointmentsTableProps } from './types';
import { Appointment } from '@/domain/entities/Appointment';
import { PhoneIcon, CreditCardIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { UserRole } from '@/domain/entities/UserRole';
import { dashboardDoctorProfilePath } from '@/navigation/paths';
import { AppointmentActionKey } from '@/domain/entities/AppointmentAction';
import { buildAppointmentIcs, downloadTextFile } from '@/presentation/utils/ics';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
	const { t } = useTranslation();
	const { label } = getAppointmentStatusPresentation(status);
	const normalized = (status || '').toString().trim().toLowerCase();

	const tone =
		normalized === 'accepted'
			? 'border-emerald-200 bg-emerald-50 text-emerald-700'
			: normalized === 'pending'
			? 'border-amber-200 bg-amber-50 text-amber-700'
			: normalized === 'rejected' || normalized === 'declined'
			? 'border-rose-200 bg-rose-50 text-rose-700'
			: normalized === 'canceled' || normalized === 'cancelled'
			? 'border-rose-200 bg-rose-50 text-rose-700'
			: normalized === 'completed' || normalized === 'finished'
			? 'border-indigo-200 bg-indigo-50 text-indigo-700'
			: 'border-gray-200 bg-gray-50 text-gray-700';

	return (
		<span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tone}`}>
			{t(label)}
		</span>
	);
};

function getOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://pyetdoktorin.al');
}

function buildGoJoinLink(appointmentId: string): string {
  const origin = getOrigin();
  return `${origin}/go/join?appointmentId=${encodeURIComponent(appointmentId)}`;
}

const ActionButtons: React.FC<{
	appointment: Appointment;
	role: UserRole;
	action: { label: string; disabled: boolean };
	onJoinCall: (id: string) => void;
	onPayNow: (id: string, amount: number) => void;
}> = ({ appointment, role, action, onJoinCall, onPayNow }) => {
	const { t } = useTranslation();
	const presentation = getAppointmentActionPresentation(appointment, role, action);
  const canAddToCalendar = action.label !== AppointmentActionKey.Past && Boolean(appointment.preferredDate);

  const addToCalendar = () => {
    const link = buildGoJoinLink(appointment.id);
    const isDoctor = role === UserRole.Doctor;
    const titleName = isDoctor ? (appointment.patientName || t('patient')) : (appointment.doctorName || t('doctor'));
    const summary = `${t('appointment') || 'Appointment'}: ${titleName}`;
    const description = `${appointment.appointmentType || ''}`.trim();
    const ics = buildAppointmentIcs(appointment, { summary, description, url: link, durationMinutes: 30 });
    if (!ics) return;
    const safeDate = (appointment.preferredDate || '').replace(/[^\d-]/g, '');
    downloadTextFile(`appointment-${safeDate || appointment.id}.ics`, ics, 'text/calendar;charset=utf-8');
  };

  const CalendarButton = canAddToCalendar ? (
    <button
      type="button"
      onClick={addToCalendar}
      className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
      aria-label={t('addToCalendar') || 'Add to calendar'}
      title={t('addToCalendar') || 'Add to calendar'}
      data-analytics="appointments.add_to_calendar"
      data-analytics-id={appointment.id}
    >
      <CalendarDaysIcon className="h-4 w-4" aria-hidden />
    </button>
  ) : null;

	if (presentation.type === 'disabled') {
		const fullLabel = t(presentation.label);
		const compactLabel =
			presentation.label === AppointmentActionKey.WaitingForAcceptance ? t('pending') : fullLabel;
		return (
      <div className="inline-flex items-center gap-2">
        <button
          className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-700 cursor-not-allowed opacity-80 whitespace-nowrap"
          disabled
          title={fullLabel}
        >
          {compactLabel}
        </button>
        {CalendarButton}
      </div>
		);
	}

	if (presentation.type === 'waiting') {
		return (
      <div className="inline-flex items-center gap-2">
        <span
          className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-[11px] font-semibold text-purple-700 whitespace-nowrap"
          title={t(presentation.label)}
        >
          {t(presentation.label)}
        </span>
        {CalendarButton}
      </div>
		);
	}

	if (presentation.type === 'processing') {
		return (
      <div className="inline-flex items-center gap-2">
        <button
          className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3.5 py-1.5 text-xs font-semibold text-purple-700 cursor-wait"
          disabled
        >
          <span className="h-3 w-3 animate-spin rounded-full border border-purple-400 border-t-transparent" />
          {t(presentation.label)}
        </button>
        {CalendarButton}
      </div>
		);
	}

	if (presentation.type === 'join') {
		return (
      <div className="inline-flex items-center gap-2">
        <button
          type="button"
          className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white transition-colors"
          onClick={() => onJoinCall(appointment.id)}
        >
          <PhoneIcon className="h-4 w-4" aria-hidden />
          <span className="sr-only">{t(presentation.label)}</span>
        </button>
        {CalendarButton}
      </div>
		);
	}

	if (presentation.type === 'pay') {
		return (
      <div className="inline-flex items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border-2 border-purple-300 px-3.5 py-1.5 text-xs font-semibold text-purple-600 hover:bg-purple-500 hover:text-white transition-colors whitespace-nowrap"
          onClick={() => onPayNow(appointment.id, PAYWALL_AMOUNT_USD)}
        >
          <CreditCardIcon className="h-4 w-4" aria-hidden />
          {t(presentation.label)}
        </button>
        {CalendarButton}
      </div>
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
	const isEmbedded = variant === 'embedded';

	const containerClass = isMinimal
		? 'mt-2 rounded-2xl border border-gray-200/70 bg-white overflow-hidden'
		: isEmbedded
		? 'mt-2'
		: 'mt-4';
	const headerRowClass = isMinimal
		? 'flex items-center text-left text-gray-600 text-[11px] tracking-[0.08em] uppercase bg-gray-50/90 border-b border-gray-200'
		: isEmbedded
		? 'flex items-center text-left text-gray-600 text-[11px] tracking-[0.08em] uppercase bg-gray-50/90 border-b border-gray-200'
		: 'flex items-center text-left text-gray-500 text-xs font-medium border-b border-gray-200 pb-3';
	const bodyWrapperClass = isMinimal || isEmbedded ? '' : 'divide-y divide-gray-100';
	const rowClass = isMinimal
		? 'flex items-center text-gray-900 text-sm py-4 hover:bg-purple-50/40 border-b border-gray-100 last:border-b-0'
		: isEmbedded
		? 'flex items-center text-gray-900 text-sm py-4 hover:bg-purple-50/40 border-b border-gray-100 last:border-b-0'
		: 'flex items-center text-gray-900 text-sm py-4';

	if (loading) return <Loader variant="inline" />;

	const sortedAppointments = appointments?.length > 0 ? sortAppointments(appointments, maxRows) : [];
	const isDoctor = role === UserRole.Doctor;

	const headers = [
		{ key: 'date', label: t('date'), width: 'w-[12%]' },
		{ key: 'person', label: isDoctor ? t('patient') : t('doctor'), width: 'w-[15%]' },
		{ key: 'type', label: t('type'), width: 'w-[12%]' },
		{ key: 'time', label: t('time'), width: 'w-[10%]' },
		{ key: 'notes', label: t('notes'), width: 'w-[25%]' },
		{ key: 'status', label: t('status'), width: 'w-[12%]' },
		...(showActions ? [{ key: 'actions', label: t('actions'), width: 'w-[14%]' }] : []),
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
												href={dashboardDoctorProfilePath(appointment.doctorId)}
												className="text-purple-500 font-medium hover:text-purple-600"
											>
												{appointment.doctorName}
											</a>
										)}
									</div>
									<div className="px-4 w-[12%]">{appointment.appointmentType}</div>
									<div className="px-4 w-[10%]">{appointment.preferredTime}</div>
									<div className="px-4 w-[25%] text-gray-700 truncate">{appointment.notes || '—'}</div>
									<div className="px-4 w-[12%]">
										<StatusBadge status={appointment.status} />
									</div>
									{showActions && (
										<div className="px-4 w-[14%] flex justify-end">
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
			<div className={isEmbedded ? 'md:hidden divide-y divide-gray-100' : 'md:hidden space-y-4'}>
				{sortedAppointments.length > 0 ? (
					sortedAppointments.map((appointment) => {
						const action = getAppointmentAction(appointment, isAppointmentPast, toUserRole(role));

						if (isEmbedded) {
							const personLabel = isDoctor ? appointment.patientName || 'N/A' : appointment.doctorName;
							return (
								<div key={appointment.id} className="px-4 py-4 hover:bg-purple-50/30 transition">
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0">
											<p className="text-sm font-semibold text-gray-900 truncate">
												{appointment.preferredDate} • {appointment.preferredTime}
											</p>
											<p className="text-xs text-gray-600 mt-0.5 truncate">
												{personLabel} • {appointment.appointmentType}
											</p>
											{appointment.notes && (
												<p className="text-xs text-gray-500 mt-1 break-words">{appointment.notes}</p>
											)}
										</div>
										<StatusBadge status={appointment.status} />
									</div>

									{showActions && (
										<div className="pt-3 flex justify-end">
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
						}

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
													href={dashboardDoctorProfilePath(appointment.doctorId)}
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
