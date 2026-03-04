'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { applyActionCode } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { getRoleLandingPath } from '@/navigation/roleRoutes';
import Loader from '@/presentation/components/Loader/Loader';
import { Card } from '@/presentation/ui/Card';
import { establishSessionForCurrentUser, sendVerificationEmail } from '@/infrastructure/services/authService';
import { CheckCircleIcon, EnvelopeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

function sanitizeNextPath(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith('/')) return null;
  if (trimmed.startsWith('//')) return null;
  if (trimmed.includes('://')) return null;
  return trimmed;
}

function getSiteOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://pyetdoktorin.al');
}

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const { loading, user, role, emailVerified } = useAuth();

  const nextTarget = useMemo(() => sanitizeNextPath(searchParams?.get('next')), [searchParams]);
  const fallbackTarget = useMemo(() => (role ? getRoleLandingPath(role) : '/dashboard'), [role]);
  const destination = nextTarget || fallbackTarget;

  const [busy, setBusy] = useState(false);
  const [localVerified, setLocalVerified] = useState<boolean>(false);
  const [resendCooldownUntil, setResendCooldownUntil] = useState<number>(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [codeApplied, setCodeApplied] = useState(false);

  useEffect(() => {
    setLocalVerified(emailVerified);
  }, [emailVerified]);

  const refreshVerification = useCallback(async () => {
    const auth = getAuth();
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    const verified = auth.currentUser.emailVerified === true;
    setLocalVerified(verified);
    return verified;
  }, []);

  useEffect(() => {
    const mode = searchParams?.get('mode');
    const oobCode = searchParams?.get('oobCode');
    if (!mode || mode !== 'verifyEmail' || !oobCode) return;
    if (codeApplied) return;

    setBusy(true);
    setError(null);
    setNotice(null);
    (async () => {
      try {
        const auth = getAuth();
        await applyActionCode(auth, oobCode);
        setCodeApplied(true);

        // Remove one-time action params from the URL to avoid re-applying on refresh.
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete('mode');
          url.searchParams.delete('oobCode');
          url.searchParams.delete('apiKey');
          url.searchParams.delete('lang');
          window.history.replaceState({}, '', url.pathname + url.search);
        } catch {
          // ignore
        }

        // If the user is signed in in this browser, we can finalize immediately.
        const verified = await refreshVerification();
        if (verified) {
          try {
            await establishSessionForCurrentUser();
            window.location.replace(destination);
            return;
          } catch {
            // If session setup fails, still show success and let user retry.
          }
        }

        setNotice(
          t('verifyEmailVerifiedSubtitle', {
            defaultValue: 'You can continue to the platform.',
          }),
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : null;
        setError(
          msg ||
            t('verifyEmailCodeInvalid', {
              defaultValue: 'This verification link is invalid or expired. Please request a new one.',
            }),
        );
      } finally {
        setBusy(false);
      }
    })();
  }, [codeApplied, destination, refreshVerification, searchParams, t]);

  const resend = async () => {
    if (Date.now() < resendCooldownUntil) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const origin = getSiteOrigin();
      const continueUrl = `${origin}/verify-email?next=${encodeURIComponent(destination)}`;
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

  const continueAfterVerify = async () => {
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
      window.location.replace(destination);
    } catch (e) {
      const msg = e instanceof Error ? e.message : null;
      setError(msg || t('unknownError', { defaultValue: 'Something went wrong.' }));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader label={t('loading', { defaultValue: 'Loading…' })} />;

  if (!user) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center px-4 py-10 bg-gradient-to-br from-purple-50 to-white">
        <Card className="card-premium w-full max-w-lg p-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center">
              <EnvelopeIcon className="h-5 w-5" aria-hidden />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-slate-900">
                {t('verifyEmailTitle', { defaultValue: 'Verify your email' })}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {codeApplied
                  ? t('verifyEmailVerifiedLoginToContinue', { defaultValue: 'Your email is verified. Please sign in to continue.' })
                  : t('verifyEmailLoginRequired', { defaultValue: 'Please sign in to resend the verification email.' })}
              </p>
            </div>
          </div>
          {busy ? (
            <div className="mt-4 flex items-center gap-3 text-sm text-slate-600">
              <span className="h-5 w-5 animate-spin rounded-full border border-purple-400 border-t-transparent" />
              <span>{t('loading', { defaultValue: 'Loading…' })}</span>
            </div>
          ) : null}
          {notice ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              {notice}
            </div>
          ) : null}
          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
              {error}
            </div>
          ) : null}
          <div className="mt-5 flex gap-2">
            <Link href={`/login?next=${encodeURIComponent(destination)}`} className="btn btn-primary">
              {t('signIn', { defaultValue: 'Sign in' })}
            </Link>
            <Link href="/" className="btn btn-ghost">
              {t('backToHome', { defaultValue: 'Back to Home' })}
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-10 bg-gradient-to-br from-purple-50 to-white">
      <Card className="card-premium w-full max-w-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-200/70 bg-gradient-to-r from-purple-800 via-purple-700 to-purple-600 text-white">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center">
              {localVerified ? <CheckCircleIcon className="h-6 w-6" aria-hidden /> : <EnvelopeIcon className="h-6 w-6" aria-hidden />}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold truncate">
                {localVerified
                  ? t('verifyEmailVerifiedTitle', { defaultValue: 'Email verified' })
                  : t('verifyEmailTitle', { defaultValue: 'Verify your email' })}
              </h1>
              <p className="mt-1 text-sm text-white/80">
                {localVerified
                  ? t('verifyEmailVerifiedSubtitle', { defaultValue: 'You can continue to the platform.' })
                  : t('verifyEmailSubtitle', { defaultValue: 'To use the platform, confirm your email address.' })}
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
              <span className="ml-2">
                {t('verifyEmailResend', { defaultValue: 'Resend email' })}
              </span>
            </button>

            <button
              type="button"
              className="btn btn-primary w-full sm:w-auto"
              onClick={continueAfterVerify}
              disabled={busy}
            >
              {localVerified
                ? t('continue', { defaultValue: 'Continue' })
                : t('verifyEmailIHaveVerified', { defaultValue: "I've verified" })}
            </button>
          </div>

          <p className="text-xs text-slate-500">
            {t('verifyEmailHint', { defaultValue: 'Tip: If the email is missing, check Spam/Junk. Verification can take a few seconds.' })}
          </p>
        </div>
      </Card>
    </div>
  );
}
