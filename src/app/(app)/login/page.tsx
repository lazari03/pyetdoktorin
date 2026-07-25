'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n/i18n';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDI } from '@/context/DIContext';
import { AuthShell } from '@/presentation/components/auth/AuthShell';
import { getRoleLandingPath } from '@/navigation/roleRoutes';
import { UserRole } from '@/domain/entities/UserRole';
import { notifyFormSubmission } from '@/presentation/utils/formNotifications';
import { GoogleIcon } from '@/presentation/components/icons/MiniIcons';
import { TermsAcceptanceModal } from '@/presentation/components/auth/TermsAcceptanceModal';
import type { PlatformTerms } from '@/application/ports/IPlatformTermsService';
import { BackendError } from '@/application/errors/BackendError';

function isPathAllowedForRole(path: string, role?: UserRole | null): boolean {
  if (!role) return false;
  if (path.startsWith('/pharmacy') && role !== UserRole.Pharmacy) return false;
  if (path.startsWith('/admin')    && role !== UserRole.Admin)    return false;
  if (path.startsWith('/clinic')   && role !== UserRole.Clinic)   return false;
  if (
    path.startsWith('/dashboard') &&
    (role === UserRole.Pharmacy || role === UserRole.Admin || role === UserRole.Clinic)
  ) return false;
  return true;
}

type TFunc = (key: string, options?: Record<string, unknown>) => string;

function sanitizeNextPath(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith('/')) return null;
  if (trimmed.startsWith('//')) return null;
  if (trimmed.includes('://')) return null;
  return trimmed;
}

function extractFirebaseAuthCode(error: unknown): string | null {
  const fromText = (text: string): string | null => {
    const paren = text.match(/\((auth\/[a-z0-9-]+)\)/i)?.[1];
    if (paren) return paren.toLowerCase();
    const any = text.match(/\bauth\/[a-z0-9-]+\b/i)?.[0];
    return any ? any.toLowerCase() : null;
  };

  if (typeof error === 'object' && error) {
    const maybe = error as { code?: unknown; message?: unknown };
    if (typeof maybe.code === 'string' && maybe.code.startsWith('auth/')) return maybe.code.toLowerCase();
    if (typeof maybe.message === 'string') return fromText(maybe.message);
  }

  if (typeof error === 'string') return fromText(error);
  return null;
}

function toLoginErrorMessage(error: unknown, t: TFunc): string {
  const offline = t('offlineError');
  const unknown = t('unknownError');

  const code = extractFirebaseAuthCode(error);
  if (code) {
    if (code === 'auth/too-many-requests') return t('tooManyAttempts') || unknown;
    if (code === 'auth/network-request-failed') return offline || unknown;
    if (
      code === 'auth/invalid-email' ||
      code === 'auth/user-not-found' ||
      code === 'auth/wrong-password' ||
      code === 'auth/invalid-credential'
    ) {
      return t('invalidEmailOrPassword') || unknown;
    }
  }

  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : '';
  if (!message) return unknown;

  if (message === offline) return offline;
  if (message === 'Email not verified') {
    return t('verifyEmailStillPending', { defaultValue: 'Email not verified yet. Open the link in your email, then try again.' });
  }

  // Avoid leaking raw Firebase messages like: "Firebase: Error (auth/...)"
  if (/\(auth\/[a-z0-9-]+\)/i.test(message) || message.startsWith('Firebase: Error')) {
    return unknown;
  }

  return message;
}

function LoginPageContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [privateDevice, setPrivateDevice] = useState(false);
  const [terms, setTerms] = useState<PlatformTerms | null>(null);
  const [termsLoading, setTermsLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const { loginUseCase, testAuthConnectionUseCase, getPlatformTermsUseCase } = useDI();

  // Test Firebase connectivity on component mount, but don't block login if it fails
  useEffect(() => {
    testAuthConnectionUseCase.execute().catch(() => {
      setErrorMsg(t('firebaseWarning'));
    });
  }, [t, testAuthConnectionUseCase]);

  const goToRoleLanding = (role?: UserRole) => {
    const next = sanitizeNextPath(searchParams?.get('next'));
    const from = sanitizeNextPath(searchParams?.get('from'));
    const target = next || from || getRoleLandingPath(role);
    router.replace(target);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      if (!navigator.onLine) {
        throw new Error(t('offlineError'));
      }
      const result = await loginUseCase.execute(email, password);
      void notifyFormSubmission({
        formType: 'login',
        source: 'login_page',
        subject: `User login: ${email}`,
        replyTo: email,
        data: {
          email,
          role: result?.role || '',
          privateDevice,
          password: '[redacted]',
        },
      });
      const next = sanitizeNextPath(searchParams?.get('next'));
      const from = sanitizeNextPath(searchParams?.get('from'));
      const roleLanding = getRoleLandingPath(result?.role);
      const requested = next || from;
      const target = (requested && isPathAllowedForRole(requested, result?.role))
        ? requested
        : roleLanding;
      router.replace(target);
    } catch (err) {
      setErrorMsg(toLoginErrorMessage(err, t as unknown as TFunc));
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const attemptGoogleLogin = async (acceptedTermsVersion?: string) => {
    setGoogleLoading(true);
    setErrorMsg('');
    try {
      if (!navigator.onLine) {
        throw new Error(t('offlineError'));
      }
      const result = await loginUseCase.executeWithGoogle(acceptedTermsVersion);
      void notifyFormSubmission({
        formType: 'login',
        source: 'login_page_google',
        subject: 'User login: Google',
        data: { role: result?.role || '', privateDevice, method: 'google' },
      });
      goToRoleLanding(result?.role);
    } catch (err) {
      // First-time Google sign-in without terms accepted yet — show the modal
      // instead of surfacing this as a login error.
      if (err instanceof BackendError && err.code === 'TERMS_REQUIRED') {
        setShowTermsModal(true);
        if (!terms) {
          setTermsLoading(true);
          getPlatformTermsUseCase.execute()
            .then(setTerms)
            .finally(() => setTermsLoading(false));
        }
        return;
      }
      setErrorMsg(toLoginErrorMessage(err, t as unknown as TFunc));
      console.error('Google login error:', err);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleLogin = () => attemptGoogleLogin();

  const handleAcceptTermsForGoogle = () => {
    if (!terms) return;
    setShowTermsModal(false);
    void attemptGoogleLogin(terms.version);
  };

  return (
    <>
    <AuthShell
      eyebrow={t('secureAccessEyebrow') || 'Secure access'}
      title={t('loginTitleSecure') || t('loginTitle')}
      subtitle={t('loginSubtitleSecure') || 'Your data is encrypted and shared only with your care team.'}
      highlights={[
        { title: t('secureHighlights1') || 'Medical-grade encryption', body: t('hipaaLine') || 'HIPAA-aware | Encrypted in transit' },
        { title: t('secureHighlights2') || 'Consent-based sharing', body: t('consentLine') || 'We share only with your selected clinicians.' },
        { title: t('secureHighlights3') || 'Role-based access control', body: t('loginSideSecure') || 'Access differs for patients and doctors.' },
      ]}
      rightCta={
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div>
            <p className="text-sm font-semibold text-gray-900">{t('noAccount')}</p>
            <p className="text-[11px] text-gray-500">{t('usePrivateWindow') || 'On a shared device? Use a private window.'}</p>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors shrink-0"
          >
            {t('registerNow')}
          </Link>
        </div>
      }
    >
      {errorMsg && (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-100">
          {errorMsg}
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading || loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <GoogleIcon className="h-4 w-4" />
        {googleLoading ? (t('signingIn') || 'Signing in...') : (t('continueWithGoogle') || 'Continue with Google')}
      </button>

      <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        <span className="h-px flex-1 bg-gray-200" />
        {t('orContinueWithEmail') || 'Or continue with email'}
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin(e);
        }}
        className="flex flex-col gap-3"
      >
        <div>
          <label className="block mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            {t('email')}
          </label>
          <input
            type="email"
            placeholder={t('emailPlaceholder')}
            className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('password')}</span>
            <Link href="/forgot-password" className="text-[11px] font-semibold text-purple-700 hover:text-purple-800">
              {t('forgotPassword')}
            </Link>
          </div>
          <input
            type="password"
            placeholder={t('passwordPlaceholder')}
            className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-gray-700">
          <input
            type="checkbox"
            checked={privateDevice}
            onChange={(e) => setPrivateDevice(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          {t('privateDevice') || 'This is a private device'}
        </label>

        <button
          type="submit"
          className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={loading || googleLoading}
        >
          {loading ? t('loggingIn') : t('loginButton')}
        </button>
      </form>
    </AuthShell>

    {showTermsModal && (
      <TermsAcceptanceModal
        terms={terms}
        loading={termsLoading}
        onAccept={handleAcceptTermsForGoogle}
        onClose={() => setShowTermsModal(false)}
      />
    )}
    </>
  );
}

export default function LoginPage() {
  return <LoginPageContent />;
}
