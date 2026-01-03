
"use client";
import { useTranslation } from 'react-i18next';

export default function DoctorDashboard() {
  const { t } = useTranslation();
  return (
    <div className="card bg-base-100 shadow-xl p-6">
      <h1 className="card-title mb-4">{t('doctorsDashboard')}</h1>
    </div>
  );
}
