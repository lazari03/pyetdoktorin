'use client';

import { useTranslation } from 'react-i18next';

export default function DoctorDashboard() {
  const { t } = useTranslation();
  
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold">{t('doctorDashboard')}</h1>
      <div className="grid gap-6 mt-6">
        {[
          { title: t('dashboard'), desc: t('quickAccessWidgets') },
          { title: t('upcomingAppointments'), desc: t('manageUpcomingAppointments') },
        ].map((card, idx) => (
          <div key={idx} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">{card.title}</h2>
              <p>{card.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}