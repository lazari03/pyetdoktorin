'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/config/routes';
import { trackAnalyticsEvent } from '@/presentation/utils/trackAnalyticsEvent';
import { reportClientError } from '@/presentation/utils/errorReporting';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();
  const [errorId] = useState(() => reportClientError({ type: 'react_error_boundary', error, digest: error?.digest }));

  useEffect(() => {
    try {
      trackAnalyticsEvent('app_global_error_boundary', {
        message: error?.message,
        digest: error?.digest,
        errorId,
      });
    } catch {
      // ignore analytics failures
    }
  }, [error, errorId]);

  const showDebug = process.env.NODE_ENV !== 'production';

  return (
    <html lang="al">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        <div className="min-h-screen py-10 px-4">
          <div className="mx-auto max-w-xl bg-white rounded-3xl shadow-lg border border-purple-50 p-6 space-y-4">
            <p className="text-xs uppercase tracking-[0.18em] text-purple-600 font-semibold">
              {t('secureAccessEyebrow') ?? 'Secure access'}
            </p>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              {t('somethingWentWrong', 'Something went wrong')}
            </h1>
            <p className="text-sm text-gray-600">
              {t('tryAgainCopy', 'Please try again. If this keeps happening, contact support.')}
            </p>
            {errorId ? (
              <p className="text-xs text-gray-500">
                {t('errorReference', 'Reference')}: <span className="font-mono">{errorId}</span>
              </p>
            ) : null}
            {showDebug ? (
              <pre className="text-[11px] text-gray-500 whitespace-pre-wrap break-words rounded-2xl bg-gray-50 border border-gray-100 p-3">
                {String(error?.message ?? error)}
              </pre>
            ) : null}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <button className="btn btn-primary" onClick={reset} data-analytics="app.global_error.retry">
                {t('retry', 'Retry')}
              </button>
              <Link href={ROUTES.ROOT} className="btn btn-ghost" data-analytics="app.global_error.home">
                {t('backToHome', 'Back to Home')}
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
