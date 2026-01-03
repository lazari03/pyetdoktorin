"use client";
import { useTranslation } from 'react-i18next';
import '@i18n';
import { useAdminStats } from '@/hooks/useAdminStats';

export function StatsCards() {
  const { t } = useTranslation();
  const { visits, requests, loading, error } = useAdminStats(5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="border rounded p-4">
        <h3 className="font-semibold mb-2">{t('mostVisitedDoctors')}</h3>
        {error && <div className="text-red-600">{error}</div>}
        {loading ? t('loading') : (
          <ul className="space-y-1">
            {visits.map(v => (<li key={v.doctor.id} className="flex justify-between"><span>{v.doctor.name}</span><span className="font-mono">{v.count}</span></li>))}
            {!visits.length && <li className="text-gray-500">{t('noData')}</li>}
          </ul>
        )}
      </div>
      <div className="border rounded p-4">
        <h3 className="font-semibold mb-2">{t('mostRequestedDoctors')}</h3>
        {loading ? t('loading') : (
          <ul className="space-y-1">
            {requests.map(v => (<li key={v.doctor.id} className="flex justify-between"><span>{v.doctor.name}</span><span className="font-mono">{v.count}</span></li>))}
            {!requests.length && <li className="text-gray-500">{t('noData')}</li>}
          </ul>
        )}
      </div>
    </div>
  );
}
