'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Loader from '@/presentation/components/Loader/Loader';
import RedirectingModal from '@/presentation/components/RedirectingModal/RedirectingModal';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { BackendError } from '@/network/backendClient';
import { extractErrorCode, getAppointmentErrorMessage, getVideoErrorMessage } from '@/presentation/utils/errorMessages';
import { APPOINTMENT_ERROR_CODES } from '@/config/errorCodes';
import { VIDEO_ERROR_CODES } from '@/config/errorCodes';
import { ROUTES } from '@/config/routes';

type Props = {
  loading: boolean;
  error: unknown;
  onRetry?: () => void;
  homeHref?: string;
  loadingLabel?: string;
  analyticsPrefix?: string;
  children: React.ReactNode;
};

function isUnauthorized(error: unknown, code: string | null): boolean {
  if (code === APPOINTMENT_ERROR_CODES.Unauthorized) return true;
  if (code === VIDEO_ERROR_CODES.AuthMissing) return true;
  if (code === VIDEO_ERROR_CODES.AuthInvalid) return true;
  if (error instanceof BackendError && error.status === 401) return true;
  return false;
}

function isForbidden(error: unknown, code: string | null): boolean {
  if (code === APPOINTMENT_ERROR_CODES.Forbidden) return true;
  if (error instanceof BackendError && error.status === 403) return true;
  return false;
}

export default function RequestStateGate({
  loading,
  error,
  onRetry,
  homeHref = ROUTES.DASHBOARD,
  loadingLabel,
  analyticsPrefix = 'request',
  children,
}: Props) {
  const { t } = useTranslation();
  const nav = useNavigationCoordinator();
  const pathname = usePathname();

  const code = useMemo(() => extractErrorCode(error), [error]);
  const unauthorized = useMemo(() => isUnauthorized(error, code), [error, code]);
  const forbidden = useMemo(() => isForbidden(error, code), [error, code]);

  const message = useMemo(() => {
    if (!error) return null;
    if (unauthorized) return t('sessionExpired');
    if (forbidden) return t('accessDenied');
    return (
      getAppointmentErrorMessage(error, t) ??
      getVideoErrorMessage(error, t) ??
      t('unknownError')
    );
  }, [error, forbidden, t, unauthorized]);

  const debugDetail = useMemo(() => {
    if (!error) return null;
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      return (error as { message: string }).message;
    }
    return null;
  }, [error]);

  useEffect(() => {
    if (!unauthorized) return;
    // Send to login and preserve return path (prevents pages from looking "blank" when tokens expire).
    nav.toLogin(pathname ?? undefined);
  }, [nav, pathname, unauthorized]);

  if (loading) {
    return <Loader label={loadingLabel ?? t('loading')} />;
  }

  if (unauthorized) {
    return <RedirectingModal show />;
  }

  if (error) {
    const showDebug = process.env.NODE_ENV !== 'production';
    return (
      <div className="py-4 sm:py-6 px-3">
        <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[.13em] text-purple-600">
            {t('secureAccessEyebrow') ?? 'Secure access'}
          </p>
          <h1 className="text-[15px] font-bold text-gray-900">
            {t('somethingWentWrong', 'Something went wrong')}
          </h1>
          <p className="text-[12.5px] text-gray-500">{message}</p>
          {showDebug && debugDetail ? (
            <p className="text-[11px] text-gray-400 break-words">detail: {debugDetail.slice(0, 240)}</p>
          ) : null}
          {showDebug && code ? (
            <p className="text-[11px] text-gray-400">code: {code}</p>
          ) : null}
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            {onRetry ? (
              <button
                className="btn btn-primary"
                onClick={onRetry}
                data-analytics={`${analyticsPrefix}.retry`}
              >
                {t('retry', 'Retry')}
              </button>
            ) : null}
            <Link href={homeHref} className="btn btn-ghost" data-analytics={`${analyticsPrefix}.home`}>
              {t('backToHome', 'Back to Home')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
