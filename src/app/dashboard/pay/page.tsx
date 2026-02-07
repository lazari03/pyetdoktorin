'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import '@/i18n/i18n';
import { useAuth } from '@/context/AuthContext';
import { openPaddleCheckout, preparePaddleCheckout } from '@/infrastructure/services/paddleCheckout';

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
  }, [t]);

  const openCheckout = useCallback(() => {
    if (!appointmentId) {
      setErrorMessage(t('missingAppointmentId'));
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMessage(null);
    openPaddleCheckout({
      appointmentId,
      userId: user?.uid ?? null,
      onClose: () => setStatus('idle'),
    }).catch(() => {
      setStatus('error');
      setErrorMessage(t('paymentFailed'));
    });
  }, [appointmentId, t, user?.uid]);

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

        {status === 'loading' && (
          <div className="text-sm text-gray-700">{t('paymentProcessing')}</div>
        )}
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
