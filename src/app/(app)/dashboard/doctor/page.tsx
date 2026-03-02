
"use client";
import { useTranslation } from 'react-i18next';

export default function DoctorDashboard() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:py-10">
        <div className="bg-white rounded-3xl border border-purple-50 shadow-lg p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-purple-600 font-semibold">
            {t('secureAccessEyebrow') ?? 'Secure access'}
          </p>
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">{t('doctorsDashboard')}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {t('manageUpcomingAppointments') ?? 'Manage upcoming appointments and notifications.'}
          </p>
        </div>
      </div>
    </div>
  );
}
