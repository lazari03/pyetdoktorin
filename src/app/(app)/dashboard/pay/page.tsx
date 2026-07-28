'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import '@/i18n/i18n';
import { DASHBOARD_PATHS } from '@/navigation/paths';
import { useDI } from '@/context/DIContext';
import { getAppointmentErrorMessage } from '@/presentation/utils/errorMessages';
import { trackAnalyticsEvent } from '@/presentation/utils/trackAnalyticsEvent';

export default function PayPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { createPolarCheckoutUseCase } = useDI();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appointmentId = searchParams?.get('appointmentId') || '';

  if (!appointmentId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{t('missingAppointmentId')}</p>
      </div>
    );
  }

  const handlePayNow = async () => {
    setError(null);
    setIsRedirecting(true);
    trackAnalyticsEvent('checkout_create_attempt', { appointmentId });
    try {
      const { checkoutUrl } = await createPolarCheckoutUseCase.execute(appointmentId);
      trackAnalyticsEvent('checkout_create_success', { appointmentId });
      window.location.href = checkoutUrl;
    } catch (err) {
      trackAnalyticsEvent('checkout_create_failed', { appointmentId });
      setError(getAppointmentErrorMessage(err, t) ?? t('checkoutCreateFailed') ?? 'Could not start checkout. Please try again.');
      setIsRedirecting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full bg-white shadow-md rounded-xl p-6 space-y-4 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">{t('paywallHeading')}</h1>
        <p className="text-sm text-gray-600">
          {t('paywallRedirectNotice') || "You'll be redirected to our payment partner to complete your payment securely."}
        </p>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handlePayNow}
          disabled={isRedirecting}
          className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          data-analytics="dashboard.pay.pay_now"
        >
          {isRedirecting ? t('redirecting') || 'Redirecting…' : t('payNow') || 'Pay now'}
        </button>

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
