'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import '@/i18n/i18n';
import { useAuth } from '@/context/AuthContext';
import { openPaddleCheckout, preparePaddleCheckout } from '@/infrastructure/services/paddleCheckout';
import { trackAnalyticsEvent } from '@/presentation/utils/trackAnalyticsEvent';
import { syncPaddlePaymentWithRetry } from '@/network/payments';
import { DASHBOARD_PATHS } from '@/navigation/paths';

export default function PayPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const appointmentId = searchParams?.get('appointmentId') || '';

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paddleReady, setPaddleReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    trackAnalyticsEvent('payment_page_loaded', { appointmentId });
    preparePaddleCheckout()
      .then(() => {
        if (!cancelled) setPaddleReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('error');
        setErrorMessage(t('paymentFailed'));
        setPaddleReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [appointmentId, t]);

  const openCheckout = useCallback(() => {
    if (!appointmentId) {
      setErrorMessage(t('missingAppointmentId'));
      setStatus('error');
      trackAnalyticsEvent('payment_checkout_failed', { reason: 'missing_appointment_id' });
      return;
    }
    setStatus('loading');
    setErrorMessage(null);
    trackAnalyticsEvent('payment_checkout_opened', { appointmentId });
    openPaddleCheckout({
      appointmentId,
      userId: user?.uid ?? null,
      onClose: () => {
        setStatus('idle');
        trackAnalyticsEvent('payment_checkout_closed', { appointmentId });
        syncPaddlePaymentWithRetry(appointmentId)
          .then((result) => {
            if (result.isPaid) {
              router.replace(`${DASHBOARD_PATHS.appointments}?paid=${encodeURIComponent(appointmentId)}`);
            }
          })
          .catch((error) => {
            console.warn('Payment sync after checkout failed', error);
          });
      },
    })
      .then(() => {
        // Checkout.open() is non-blocking; immediately revert to idle so the UI doesn't get stuck.
        setStatus('idle');
      })
      .catch(() => {
      setStatus('error');
      setErrorMessage(t('paymentFailed'));
      trackAnalyticsEvent('payment_checkout_failed', { appointmentId, reason: 'open_failed' });
    });
  }, [appointmentId, router, t, user?.uid]);

  if (!appointmentId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{t('missingAppointmentId')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full bg-white shadow-md rounded-xl p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">{t('paywallHeading')}</h1>
        <p className="text-sm text-gray-600">{t('paywallSubheading')}</p>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">{t('payWithCard')}</p>
            <button
              onClick={openCheckout}
              disabled={!paddleReady || status === 'loading'}
              className="w-full inline-flex items-center justify-center rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {t('payNow')}
            </button>
          </div>
        </div>

        {/* Intentionally avoid rendering a persistent "processing" message here.
            The checkout overlay handles the payment flow and may not reliably
            emit close events across SDK versions. */}
        {status === 'success' && (
          <div className="text-sm text-green-600">{t('paymentSucceeded')}</div>
        )}
        {status === 'error' && (
          <div className="text-sm text-red-600">{errorMessage || t('paymentFailed')}</div>
        )}

        <button
          className="w-full mt-2 text-sm font-medium text-gray-700 underline"
          onClick={() => router.back()}
        >
          {t('goBack')}
        </button>
      </div>

      {!paddleReady && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-lg px-4 py-2 rounded-full text-sm text-gray-700">
          {t('loadingPayments')}
        </div>
      )}
    </div>
  );
}
