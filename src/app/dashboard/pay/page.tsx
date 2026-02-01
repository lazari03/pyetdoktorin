'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import { useTranslation } from 'react-i18next';
import '@/i18n/i18n';
import { createPayPalOrder, capturePayPalOrder } from '@/network/paypalApiClient';

type PayPalButtons = (config: unknown) => { render: (selector: string) => void };
type PayPalFunding = { PAYPAL?: string; CARD?: string };
type PayPalClient = {
  Buttons: PayPalButtons;
  FUNDING: PayPalFunding;
};

declare global {
  interface Window {
    paypal?: PayPalClient;
  }
}

export default function PayPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const appointmentId = searchParams?.get('appointmentId') || '';
  const buttonsRendered = useRef(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cardEligible, setCardEligible] = useState<boolean | null>(null);

  // Render PayPal buttons once the script is ready
  const renderButtons = useCallback(() => {
    if (buttonsRendered.current || !window.paypal || !appointmentId) return;
    buttonsRendered.current = true;

    const commonConfig = {
      style: { layout: 'vertical', shape: 'rect', label: 'paypal' },
      createOrder: async () => {
        setStatus('loading');
        setErrorMessage(null);
        const { data } = await createPayPalOrder(appointmentId);
        return data.orderId;
      },
      onApprove: async (data: { orderID: string }) => {
        try {
          setStatus('loading');
          await capturePayPalOrder(data.orderID);
          setStatus('success');
          router.replace('/dashboard/appointments');
        } catch {
          setStatus('error');
          setErrorMessage(t('paymentFailed'));
        }
      },
      onCancel: () => setStatus('idle'),
      onError: (err: unknown) => {
        console.error('PayPal error', err);
        setStatus('error');
        setErrorMessage(t('paymentFailed'));
      },
    };

    // PayPal (yellow)
    window.paypal.Buttons({
      ...commonConfig,
      fundingSource: window.paypal.FUNDING.PAYPAL,
    }).render('#paypal-button-container');

    // Card (black) — will auto-hide if not eligible
    try {
      window.paypal
        .Buttons({
          ...commonConfig,
          fundingSource: window.paypal.FUNDING.CARD,
        })
        .render('#card-button-container');
      setCardEligible(true);
    } catch {
      setCardEligible(false);
    }
  }, [appointmentId, router, t]);

  useEffect(() => {
    if (window.paypal) {
      renderButtons();
    }
  }, [appointmentId, renderButtons]);

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
            <p className="text-xs font-semibold text-gray-700 mb-2">{t('payWithPaypal')}</p>
            <div id="paypal-button-container" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">{t('payWithCard')}</p>
            <div id="card-button-container" />
            {cardEligible === false && (
              <p className="text-[11px] text-red-500 mt-1">{t('cardUnavailable')}</p>
            )}
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

      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ''}&currency=USD&intent=capture&components=buttons,funding-eligibility&enable-funding=card&disable-funding=venmo`}
        strategy="afterInteractive"
        onLoad={renderButtons}
      />
    </div>
  );
}
