'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import { useTranslation } from 'react-i18next';
import '@/i18n/i18n';
import { createPayPalOrder, capturePayPalOrder } from '@/network/paypalApiClient';
import { useAuth } from '@/context/AuthContext';

type PayPalButtons = (config: unknown) => { render: (selector: string) => Promise<void> };
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
  const { user } = useAuth();

  const appointmentId = searchParams?.get('appointmentId') || '';
  const clientId =
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
    'BAAmC82dZnH-aMF5R14OE87F-QRurvsOnMoQLtxRoqKyhkf1i8v-TLxBmLWEm1xThf3dGkOX4P2QYNPXes';

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cardEligible, setCardEligible] = useState<boolean | null>(null);
  const [paypalReady, setPaypalReady] = useState(false);
  const [approvalUrl, setApprovalUrl] = useState<string | null>(null);
  const renderedRef = useRef(false);

  const renderButtons = useCallback(() => {
    if (!window.paypal || !appointmentId || !user?.uid || renderedRef.current) return;
    renderedRef.current = true;

    const baseConfig = {
      style: {
        shape: 'pill',
        layout: 'vertical',
        color: 'silver',
        label: 'paypal',
      },
      createOrder: async () => {
        setStatus('loading');
        setErrorMessage(null);
        const { data } = await createPayPalOrder(appointmentId, user.uid);
        setApprovalUrl(data.approvalUrl || null);
        return data.orderId;
      },
      onApprove: async (data: { orderID?: string }) => {
        if (!data.orderID) return;
        try {
          setStatus('loading');
          await capturePayPalOrder(data.orderID);
          setStatus('success');
          router.push(`/dashboard/appointments?paid=${appointmentId}`);
        } catch (err) {
          console.error(err);
          setStatus('error');
          setErrorMessage(t('paymentFailed'));
        }
      },
      onError: (err: unknown) => {
        console.error(err);
        setStatus('error');
        setErrorMessage(t('paymentFailed'));
      },
      onCancel: () => {
        setStatus('idle');
      },
    };

    // PayPal wallet
    window.paypal.Buttons(baseConfig).render('#paypal-button-container');

    // Card funding
    window.paypal
      .Buttons({
        ...baseConfig,
        fundingSource: window.paypal.FUNDING.CARD,
        style: {
          shape: 'pill',
          layout: 'vertical',
          color: 'white',
          label: 'pay',
        },
      })
      .render('#card-button-container')
      .then(() => setCardEligible(true))
      .catch(() => setCardEligible(false));
  }, [appointmentId, router, t, user?.uid]);

  // Re-render buttons once user info arrives and SDK is present (e.g., after hydration)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (paypalReady && window.paypal && appointmentId && user?.uid) {
      renderButtons();
    }
  }, [appointmentId, paypalReady, renderButtons, user?.uid]);

  // Fallback: pre-create approval link in case buttons are blocked
  useEffect(() => {
    const fetchLink = async () => {
      if (!appointmentId || !user?.uid) return;
      try {
        const { data } = await createPayPalOrder(appointmentId, user.uid);
        setApprovalUrl(data.approvalUrl || null);
      } catch (err) {
        console.error(err);
        setErrorMessage(t('paymentFailed'));
        setStatus('error');
      }
    };
    fetchLink();
  }, [appointmentId, t, user?.uid]);

  // Detect SDK failure (blocked CSP / network)
  useEffect(() => {
    if (!paypalReady) return;
    const timer = setTimeout(() => {
      if (!window.paypal) {
        setStatus('error');
        setErrorMessage(t('paypalBlocked') || 'PayPal was blocked by the browser. Use the fallback button below.');
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [paypalReady, t]);

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

        {approvalUrl && (
          <div className="pt-2 space-y-2">
            <p className="text-xs font-semibold text-gray-700">
              {t('fallbackCheckout') || 'If buttons do not appear, use the secure PayPal checkout link:'}
            </p>
            <a
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-purple-400 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-50 transition"
              href={approvalUrl}
              target="_blank"
              rel="noreferrer"
            >
              {t('openPaypal') || 'Open PayPal'}
            </a>
          </div>
        )}

        <button
          className="w-full mt-2 text-sm font-medium text-gray-700 underline"
          onClick={() => router.back()}
        >
          {t('goBack')}
        </button>
      </div>

      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons,funding-eligibility&enable-funding=card&disable-funding=venmo`}
        strategy="afterInteractive"
        onLoad={() => setPaypalReady(true)}
        onError={() => {
          setStatus('error');
          setErrorMessage(t('paymentFailed'));
        }}
      />

      {!paypalReady && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-lg px-4 py-2 rounded-full text-sm text-gray-700">
          {t('loadingPayments')}
        </div>
      )}
    </div>
  );
}
