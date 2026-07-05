
"use client";
import { useTranslation } from 'react-i18next';

export default function DoctorDashboard() {
  const { t } = useTranslation();
  return (
    <div>
      <div className="py-4 sm:py-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-[10px] font-bold uppercase tracking-[.13em] text-purple-600">
            {t('secureAccessEyebrow') ?? 'Secure access'}
          </p>
          <h1 className="text-[15px] font-bold text-gray-900 mt-2">{t('doctorsDashboard')}</h1>
          <p className="text-[12.5px] text-gray-500 mt-1">
            {t('manageUpcomingAppointments') ?? 'Manage upcoming appointments and notifications.'}
          </p>
        </div>
      </div>
    </div>
  );
}
