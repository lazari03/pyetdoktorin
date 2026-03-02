import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { DASHBOARD_PATHS } from '@/navigation/paths';
import { z } from '@/config/zIndex';

export default function AppointmentConfirmation({ onClose }: { onClose: () => void }) {
	const { t } = useTranslation();

	return (
	<div className={`fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 ${z.modal}`}>
			<div className={`relative w-full max-w-sm rounded-3xl bg-white border border-gray-100 shadow-xl overflow-hidden ${z.modalContent}`}>
				{/* Close Button */}
				<button
					className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
					onClick={onClose}
					aria-label={t('close')}
				>
					<span className="text-xl leading-none">&times;</span>
				</button>

				{/* Themed Top Section */}
				<div className="flex flex-col items-center justify-center bg-gradient-to-r from-primary to-secondary px-6 pt-8 pb-6 text-white">
					{/* Success Icon */}
					<div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
						<svg
							className="w-9 h-9"
							fill="none"
							viewBox="0 0 48 48"
							stroke="currentColor"
							strokeWidth="3"
						>
							<circle cx="24" cy="24" r="20" className="text-white/70" />
							<path
								d="M16 25l6 6 10-12"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="text-white"
							/>
						</svg>
					</div>
					<span className="text-lg font-semibold tracking-wide">
						{t('appointmentSuccess')}
					</span>
					<p className="mt-1 text-xs text-white/80 text-center max-w-xs">
						{t('appointmentRequestSent')}
					</p>
				</div>

				{/* Message & CTA Section */}
				<div className="px-6 py-6 flex flex-col items-stretch gap-5 bg-white">
					<p className="text-sm text-gray-600 text-center">
						{t('appointmentNotificationInfo')}
					</p>

						<div className="flex flex-col gap-3">
							<Link href={DASHBOARD_PATHS.appointments} className="w-full">
								<button
									className="w-full rounded-full bg-primary text-white font-semibold py-3 text-sm shadow-md hover:bg-secondary transition-colors"
								>
									{t('goToAppointmentHistory')}
								</button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
