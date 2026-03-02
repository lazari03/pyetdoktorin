'use client';

import { useTranslation } from 'react-i18next';

export default function DoctorDashboard() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:py-10 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-purple-600 font-semibold">
            {t('secureAccessEyebrow') ?? 'Secure access'}
          </p>
          <h1 className="text-2xl font-semibold text-gray-900">{t('doctorDashboard')}</h1>
        </div>
        <div className="grid gap-4">
          {[
            { title: t('dashboard'), desc: t('quickAccessWidgets') },
            { title: t('upcomingAppointments'), desc: t('manageUpcomingAppointments') },
          ].map((card, idx) => (
            <div key={idx} className="rounded-2xl bg-white border border-purple-50 shadow-md p-5">
              <h2 className="text-sm font-semibold text-gray-900">{card.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
