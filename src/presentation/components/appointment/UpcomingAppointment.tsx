import { useTranslation } from 'react-i18next';
import { useAppointmentStore } from '@/store/appointmentStore';
import { useAuth } from '@/context/AuthContext';
import Loader from '@/presentation/components/Loader/Loader';
import { UserRole } from '@/domain/entities/UserRole';

const UpcomingAppointment = () => {
	const { t } = useTranslation();
	const { appointments, loading } = useAppointmentStore();
	const { role } = useAuth();

	// Find all accepted, future appointments
	const now = new Date();
	const futureAccepted = appointments
		.filter((a) => {
			const dateTime = new Date(`${a.preferredDate}T${a.preferredTime}`);
			return a.status === 'accepted' && dateTime > now;
		})
		.sort((a, b) => {
			const dateA = new Date(`${a.preferredDate}T${a.preferredTime}`).getTime();
			const dateB = new Date(`${b.preferredDate}T${b.preferredTime}`).getTime();
			return dateA - dateB;
		});

	// The soonest upcoming appointment
	const upcoming = futureAccepted[0] || null;

	// Show doctor or patient name depending on role
	let nameLabel = '';
	let nameValue = '';
	if (upcoming) {
		if (role === UserRole.Doctor) {
			nameLabel = t('patient');
			nameValue = upcoming.patientName || t('unknown');
		} else {
			nameLabel = t('doctor');
			nameValue = upcoming.doctorName || t('unknown');
		}
	}

	return (
		<div className="stats shadow h-full">
			<div className="stat">
				<div className="stat-title">{t('upcomingAppointment')}</div>
				<div className="stat-value text-base text-purple-500">
					{loading ? (
						<Loader variant="inline" />
					) : upcoming ? (
						<span className="block text-purple-500 whitespace-nowrap overflow-hidden text-ellipsis max-w-full" style={{wordBreak: 'break-word'}}>
							{upcoming.preferredDate} {t('at')} {upcoming.preferredTime} &nbsp; {nameLabel}: {nameValue}
						</span>
					) : (
						<span className="text-gray-600">{t('noUpcomingAppointment')}</span>
					)}
				</div>
			</div>
		</div>
	);
};

export default UpcomingAppointment;
