'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAuth } from 'firebase/auth';
import { ArrowPathIcon, EnvelopeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { z } from '@/config/zIndex';
import { establishSessionForCurrentUser, sendVerificationEmail } from '@/infrastructure/services/authService';

function getSiteOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://pyetdoktorin.al');
}

export default function EmailVerificationRequiredModal({
  isOpen,
  onLogout,
}: {
  isOpen: boolean;
  onLogout: () => void;
}) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldownUntil, setResendCooldownUntil] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const refreshVerification = async (): Promise<boolean> => {
    const auth = getAuth();
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    return auth.currentUser.emailVerified === true;
  };

  const resend = async () => {
    if (Date.now() < resendCooldownUntil) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const origin = getSiteOrigin();
      const next = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/dashboard';
      const continueUrl = `${origin}/verify-email?next=${encodeURIComponent(next)}`;
      await sendVerificationEmail({ continueUrl });
      setNotice(t('verifyEmailSent', { defaultValue: 'Verification email sent. Please check your inbox.' }));
      setResendCooldownUntil(Date.now() + 30_000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : null;
      setError(msg || t('unknownError', { defaultValue: 'Something went wrong.' }));
    } finally {
      setBusy(false);
    }
  };

  const iHaveVerified = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const verified = await refreshVerification();
      if (!verified) {
        setNotice(t('verifyEmailStillPending', { defaultValue: 'Email not verified yet. Open the link in your email, then try again.' }));
        return;
      }
      await establishSessionForCurrentUser();
      if (typeof window !== 'undefined') window.location.reload();
    } catch (e) {
      const msg = e instanceof Error ? e.message : null;
      setError(msg || t('unknownError', { defaultValue: 'Something went wrong.' }));
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 ${z.modal}`}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" aria-hidden />
      <div className={`relative ${z.modalContent} min-h-[100dvh] flex items-center justify-center p-4`}>
        <div role="dialog" aria-modal="true" className="w-full max-w-3xl card-premium overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-purple-800 via-purple-700 to-purple-600 text-white">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                <EnvelopeIcon className="h-6 w-6" aria-hidden />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold truncate">
                  {t('verifyEmailTitle', { defaultValue: 'Verify your email' })}
                </h1>
                <p className="mt-1 text-sm text-white/85">
                  {t('verifyEmailSubtitle', { defaultValue: 'To use the platform, confirm your email address.' })}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 flex items-start gap-3">
              <div className="mt-0.5 h-9 w-9 rounded-full bg-white text-amber-700 border border-amber-200 flex items-center justify-center shadow-sm">
                <span className="text-lg font-semibold">!</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800">
                  {t('verifyEmailBannerTitle', { defaultValue: 'Verification required' })}
                </p>
                <p className="text-xs text-amber-700">
                  {t('verifyEmailBannerBody', { defaultValue: 'Open the verification link we sent to your email to unlock the platform.' })}
                </p>
              </div>
            </div>

            {notice ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                {notice}
              </div>
            ) : null}
            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <button
                type="button"
                className="btn btn-outline w-full sm:w-auto"
                onClick={resend}
                disabled={busy || Date.now() < resendCooldownUntil}
              >
                <ArrowPathIcon className="h-4 w-4" aria-hidden />
                <span className="ml-2">{t('verifyEmailResend', { defaultValue: 'Resend email' })}</span>
              </button>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button type="button" className="btn btn-ghost w-full sm:w-auto" onClick={onLogout} disabled={busy}>
                  {t('logOut', { defaultValue: 'Log out' })}
                </button>
                <button type="button" className="btn btn-primary w-full sm:w-auto" onClick={iHaveVerified} disabled={busy}>
                  <ShieldCheckIcon className="h-4 w-4" aria-hidden />
                  <span className="ml-2">{t('verifyEmailIHaveVerified', { defaultValue: "I've verified" })}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              {t('verifyEmailHint', { defaultValue: 'Tip: If the email is missing, check Spam/Junk. Verification can take a few seconds.' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

