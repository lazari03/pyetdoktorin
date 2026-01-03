import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function AppointmentConfirmation({ onClose }: { onClose: () => void }) {
	const { t } = useTranslation();
	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
			<div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xs p-0 overflow-hidden">
				{/* X Close Button */}
				<button
					className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold z-10"
					onClick={onClose}
					aria-label={t('close')}
				>
					&times;
				</button>
				{/* Green Success Top Section */}
				<div className="flex flex-col items-center justify-center bg-orange-400 p-6 rounded-t-2xl">
					{/* Success Icon */}
					<svg className="w-14 h-14 mb-2" fill="none" viewBox="0 0 48 48" stroke="white" strokeWidth="3">
						<circle cx="24" cy="24" r="22" stroke="white" strokeWidth="3" fill="none" />
						<path d="M16 25l6 6 10-12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
					<span className="text-white text-lg font-semibold tracking-wide">{t('appointmentSuccess')}</span>
				</div>
				{/* Message Section */}
				<div className="flex flex-col items-center bg-white px-6 py-8">
					<p className="text-gray-700 text-center mb-6 text-base">
						{t('appointmentRequestSent')}<br />{t('appointmentNotificationInfo')}
					</p>
					<Link href="/dashboard/appointments" className="w-full">
						<button
							className="w-full bg-orange-400 hover:bg-orange-500 text-white font-semibold py-3 rounded-full shadow transition-all text-lg"
							style={{ boxShadow: '0 4px 16px 0 rgba(255, 152, 0, 0.15)' }}
						>
							{t('goToAppointmentHistory')}
						</button>
					</Link>
				</div>
			</div>
		</div>
	);
}