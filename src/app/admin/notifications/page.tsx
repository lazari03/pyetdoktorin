"use client";

import { ToastProvider } from '../components/ToastProvider';
import DashboardShell from '@/app/components/DashboardShell';
import { useTranslation } from 'react-i18next';
import '@i18n';

export default function AdminNotificationsPage() {
  const { t } = useTranslation();
  return (
    <ToastProvider>
      <DashboardShell>
        <div className="p-4 md:p-6">
          <h1 className="text-2xl font-bold mb-4">{t('notifications')}</h1>
          <p className="text-gray-600">{t('adminNotificationsPlaceholder')}</p>
        </div>
      </DashboardShell>
    </ToastProvider>
  );
}
