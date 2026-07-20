'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import '@/i18n/i18n';
import { useDI } from '@/context/DIContext';
import { BackendError } from '@/application/errors/BackendError';
import { trackAnalyticsEvent } from '@/presentation/utils/trackAnalyticsEvent';
import { DASHBOARD_PATHS } from '@/navigation/paths';

const PAYPAL_BUTTON_CONTAINER_ID = 'paypal-button-container';

function messageForError(error: unknown, t: (key: string) => string): string {
  if (error instanceof BackendError) {
    if (error.code === 'PAYMENT_DECLINED') return t('paymentDeclined') || 'This payment method was declined.';
    if (error.code === 'PAYMENT_NOT_COMPLETED') return t('paymentNotCompleted') || "The payment didn't complete.";
  }
  return t('paymentFailed') || 'Payment failed. Please try again.';
}

export default function PayPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { handlePayNowUseCase, prepareCheckoutUseCase, openCheckoutUseCase } = useDI();

  const appointmentId = searchParams?.get('appointmentId') || '';

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checkoutReady, setCheckoutReady] = useState(false);

  const onSuccess = useCallback(() => {
    setStatus('success');
    trackAnalyticsEvent('payment_checkout_succeeded', { appointmentId });
    router.replace(`${DASHBOARD_PATHS.appointments}?paid=${encodeURIComponent(appointmentId)}`);
  }, [appointmentId, router]);

  const onCancel = useCallback(() => {
    trackAnalyticsEvent('payment_checkout_closed', { appointmentId });
  }, [appointmentId]);

  const onError = useCallback((err: unknown) => {
    console.warn('PayPal checkout failed', err);
    setStatus('error');
    setErrorMessage(messageForError(err, t));
    trackAnalyticsEvent('payment_checkout_failed', {
      appointmentId,
      reason: err instanceof BackendError ? err.code || 'checkout_error' : 'checkout_error',
    });
  }, [appointmentId, t]);

  useEffect(() => {
    if (!appointmentId) return;

    let cancelled = false;
    trackAnalyticsEvent('payment_page_loaded', { appointmentId });

    (async () => {
      try {
        await handlePayNowUseCase.execute(appointmentId);
        await prepareCheckoutUseCase.execute();
        if (cancelled) return;
        await openCheckoutUseCase.execute({
          containerId: PAYPAL_BUTTON_CONTAINER_ID,
          appointmentId,
          onSuccess,
          onCancel,
          onError,
        });
        if (!cancelled) setCheckoutReady(true);
      } catch (error) {
        if (cancelled) return;
        console.warn('Failed to initialize PayPal checkout', error);
        setStatus('error');
        setErrorMessage(messageForError(error, t));
        setCheckoutReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [appointmentId, onSuccess, onCancel, onError, t, handlePayNowUseCase, prepareCheckoutUseCase, openCheckoutUseCase]);

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

        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700">{t('choosePaymentMethod') || 'Choose a payment method'}</p>
          <div id={PAYPAL_BUTTON_CONTAINER_ID} />
        </div>

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

      {!checkoutReady && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-lg px-4 py-2 rounded-full text-sm text-gray-700">
          {t('loadingPayments')}
        </div>
      )}
    </div>
  );
}
