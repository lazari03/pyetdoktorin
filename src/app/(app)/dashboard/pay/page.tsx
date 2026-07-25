'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import '@/i18n/i18n';
import { DASHBOARD_PATHS } from '@/navigation/paths';

export default function PayPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();

  const appointmentId = searchParams?.get('appointmentId') || '';

  if (!appointmentId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{t('missingAppointmentId')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full bg-white shadow-md rounded-xl p-6 space-y-4 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">{t('paywallHeading')}</h1>
        <p className="text-sm text-gray-600">
          {t('paymentsComingSoon') || "Online payments aren't available yet — we're setting up a new payment method. Please check back soon."}
        </p>

        <button
          className="w-full mt-2 text-sm font-medium text-purple-700 underline"
          onClick={() => router.push(DASHBOARD_PATHS.appointments)}
        >
          {t('backToAppointments') || 'Back to appointments'}
        </button>
      </div>
    </div>
  );
}
