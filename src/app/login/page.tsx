'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n/i18n';
import Link from 'next/link';
import { useDI } from '@/context/DIContext';
import { useGoogleReCaptcha, GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { AuthShell } from '@/presentation/components/auth/AuthShell';
import { useAuth } from '@/context/AuthContext';
import { getRoleLandingPath } from '@/navigation/roleRoutes';

interface LoginPageContentProps {
  onRetryRecaptcha: () => void;
  retryCount: number;
  maxRetries: number;
}

function LoginPageContent({ onRetryRecaptcha, retryCount, maxRetries }: LoginPageContentProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [privateDevice, setPrivateDevice] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState(false);
  const [hasSessionCookie, setHasSessionCookie] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const isRecaptchaReady = !!executeRecaptcha;
  const [recaptchaState, setRecaptchaState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const allowRecaptchaBypass =
    process.env.NODE_ENV !== 'production' ||
    process.env.NEXT_PUBLIC_RECAPTCHA_OPTIONAL === 'true';
  const { loginUseCase, testAuthConnectionUseCase } = useDI();
  const recaptchaTimeoutMs = 5000;

  // Track reCAPTCHA readiness with a hard timeout so UI never gets stuck
  useEffect(() => {
    if (isRecaptchaReady) {
      setRecaptchaState('ready');
      return;
    }
    setRecaptchaState('loading');
    const timer = setTimeout(() => {
      setRecaptchaState('failed');
    }, recaptchaTimeoutMs);
    return () => clearTimeout(timer);
  }, [isRecaptchaReady, retryCount, recaptchaTimeoutMs]);

  const { isAuthenticated, role, loading: authLoading } = useAuth();

  const initialAuthRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (initialAuthRef.current === null) {
      initialAuthRef.current = isAuthenticated;
    }
  }, [authLoading, isAuthenticated]);

  const readSessionCookie = () => {
    if (typeof document === 'undefined') return false;
    return /(?:^|; )loggedIn=/.test(document.cookie);
  };

  useEffect(() => {
    setHasSessionCookie(readSessionCookie());
  }, [isAuthenticated, pendingRedirect, authLoading]);

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    if (!pendingRedirect && !initialAuthRef.current) return;
    if (!hasSessionCookie) return;
    const target = getRoleLandingPath(role);
    window.location.href = target;
  }, [isAuthenticated, authLoading, role, pendingRedirect, hasSessionCookie]);

  // Test Firebase connectivity on component mount, but don't block login if it fails
  useEffect(() => {
    testAuthConnectionUseCase.execute().catch(() => {
      setErrorMsg(t('firebaseWarning'));
    });
  }, [t, testAuthConnectionUseCase]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      if (!navigator.onLine) {
        throw new Error(t('offlineError'));
      }
      let token: string | null = null;
      if (executeRecaptcha) {
        token = await executeRecaptcha('login');
      }
      if (token) {
        const recaptchaRes = await fetch('/api/verify-recaptcha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const recaptchaData = await recaptchaRes.json();
        if (!recaptchaData.success) {
          setErrorMsg(t('recaptchaFailed'));
          setLoading(false);
          return;
        }
      } else if (!allowRecaptchaBypass) {
        setErrorMsg(t('recaptchaUnavailable') || 'reCAPTCHA unavailable. Please refresh the page.');
        setLoading(false);
        return;
      }
      // Only proceed with login if reCAPTCHA passes
      await loginUseCase.execute(email, password);
      const waitForSessionCookie = async () => {
        const maxAttempts = 10;
        for (let i = 0; i < maxAttempts; i += 1) {
          if (readSessionCookie()) return true;
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        return false;
      };
      const cookieReady = await waitForSessionCookie();
      if (!cookieReady) {
        setErrorMsg(t('authTokenWarning'));
        setLoading(false);
        return;
      }
      setHasSessionCookie(true);
      setPendingRedirect(true);
    } catch (err) {
      setErrorMsg(t('unknownError'));
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
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
        <div className="space-y-2">
          <p className="text-sm font-semibold text-white">{t('noAccount')}</p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-full bg-white text-purple-700 px-4 py-2 text-sm font-semibold hover:bg-purple-50"
          >
            {t('registerNow')}
          </Link>
          <p className="text-[11px] text-white/80">{t('usePrivateWindow') || 'On a shared device? Use a private window.'}</p>
        </div>
      }
    >
      {errorMsg && (
        <div className="mt-2 rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-800 border border-red-100">
          {errorMsg}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin(e);
        }}
        className="flex flex-col gap-4"
      >
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            {t('email')}
          </label>
          <input
            type="email"
            placeholder={t('emailPlaceholder')}
            className="block w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">{t('password')}</span>
            <Link href="/forgot-password" className="text-xs text-purple-600 hover:text-purple-700">
              {t('forgotPassword')}
            </Link>
          </div>
          <input
            type="password"
            placeholder={t('passwordPlaceholder')}
            className="block w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
          disabled={loading || (!allowRecaptchaBypass && recaptchaState === 'loading' && !isRecaptchaReady)}
        >
          {loading ? t('loggingIn') : t('loginButton')}
        </button>

        {!isRecaptchaReady && (
          <div className="text-xs text-gray-500 mt-2">
            {recaptchaState === 'loading' ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span>{t('recaptchaLoading')}</span>
              </div>
            ) : retryCount < maxRetries ? (
              <div className="flex items-center gap-2">
                <span className="text-amber-600">{t('recaptchaFailed') || 'reCAPTCHA failed to load.'}</span>
                <button
                  type="button"
                  onClick={onRetryRecaptcha}
                  className="text-purple-600 hover:text-purple-700 underline"
                >
                  {t('retry') || 'Retry'} ({retryCount + 1}/{maxRetries})
                </button>
              </div>
            ) : (
              <span className={`text-${allowRecaptchaBypass ? 'amber' : 'red'}-600`}>
                {allowRecaptchaBypass
                  ? (t('recaptchaUnavailable') || 'reCAPTCHA unavailable. You can continue without it.')
                  : (t('recaptchaUnavailable') || 'reCAPTCHA unavailable. Please refresh the page.')}
              </span>
            )}
          </div>
        )}
      </form>

      <div className="text-xs text-gray-500 text-center">
        {t('hipaaLine') || 'HIPAA-aware | Encrypted in transit'}
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  // Key to force reCAPTCHA provider remount
  const [providerKey, setProviderKey] = useState(() => Date.now());
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  
  // Function to retry loading reCAPTCHA
  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount((r) => r + 1);
      setProviderKey(Date.now()); // Force provider remount
    }
  };
  
  if (!siteKey) {
    console.error('NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not configured');
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="text-red-600">reCAPTCHA configuration error. Please contact support.</div>
      </div>
    );
  }
  
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={siteKey}
      scriptProps={{ async: true, defer: true, appendTo: 'head' }}
      key={providerKey}
    >
      <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>}>
        <LoginPageContent onRetryRecaptcha={handleRetry} retryCount={retryCount} maxRetries={maxRetries} />
      </Suspense>
    </GoogleReCaptchaProvider>
  );
}
