'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function DashboardNotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-3xl border border-purple-100 bg-white shadow-lg p-8 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-purple-600 font-semibold">
          {t('notFoundEyebrow') || 'Navigation'}
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-2">
          {t('notFoundTitle') || 'Page not found'}
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          {t('notFoundSubtitle') || 'The page you are looking for does not exist.'}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors"
          >
            {t('backToDashboard') || t('goToDashboard') || 'Back to dashboard'}
          </Link>
          <Link
            href="/dashboard/appointments"
            className="inline-flex items-center rounded-full border border-purple-200 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-50 transition-colors"
          >
            {t('viewAll') || 'View all'}
          </Link>
        </div>
      </div>
    </div>
  );
}
