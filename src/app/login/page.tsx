'use client';

import { useState, useEffect, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n/i18n';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { login } from '@/domain/authService';
import { testFirebaseConnection } from '@/domain/firebaseTest';
import { useGoogleReCaptcha, GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

type RegisterFormState = {
  name: string;
  surname: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'patient' | 'doctor';
};

interface LoginPageContentProps {
  onRetryRecaptcha: () => void;
  retryCount: number;
  maxRetries: number;
}

function LoginPageContent({ onRetryRecaptcha, retryCount, maxRetries }: LoginPageContentProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [registerData, setRegisterData] = useState<RegisterFormState>({
    name: '',
    surname: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
  });
  const searchParams = useSearchParams();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [waitingForRecaptcha, setWaitingForRecaptcha] = useState(true);
  const isRecaptchaReady = !!executeRecaptcha;

  // Give reCAPTCHA 5 seconds to load, then allow retry or proceed
  useEffect(() => {
    if (isRecaptchaReady) {
      setWaitingForRecaptcha(false);
      return;
    }
    
    const timer = setTimeout(() => {
      setWaitingForRecaptcha(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [isRecaptchaReady]);

  // Reset waiting state when retry happens (provider remounts)
  useEffect(() => {
    if (retryCount > 0) {
      setWaitingForRecaptcha(true);
    }
  }, [retryCount]);

  // Get the 'from' parameter to redirect after login
  const fromPath = searchParams?.get('from') || '/dashboard';

  // Test Firebase connectivity on component mount, but don't block login if it fails
  useEffect(() => {
    testFirebaseConnection().catch(() => {
      setErrorMsg(t('firebaseWarning'));
    });
  }, [t]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      if (!navigator.onLine) {
        throw new Error(t('offlineError'));
      }
      if (!executeRecaptcha) {
        throw new Error(t('recaptchaNotReady'));
      }
      // Get reCAPTCHA token
      const token = await executeRecaptcha('login');
      // Verify token with backend
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
      // Only proceed with login if reCAPTCHA passes
      await login(email, password);
      // Verify if the 'loggedIn' cookie is set (HttpOnly session is not visible to JS)
      if (!document.cookie.includes('loggedIn=')) {
        setErrorMsg(t('authTokenWarning'));
        setLoading(false);
        return;
      }
      window.location.href = fromPath;
    } catch (err) {
      setErrorMsg(t('unknownError'));
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl bg-white shadow-md rounded-xl overflow-hidden flex flex-col md:flex-row">
        {/* LEFT: card with login/register form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-center mx-auto mb-4 text-gray-800">
            {mode === 'login' ? t('loginTitle') : t('register')}
          </h2>

          {errorMsg && (
            <div className="mt-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-800 border border-red-200">
              {errorMsg}
            </div>
          )}

          {mode === 'login' ? (
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
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{t('password')}</span>
                  <Link href="/forgot-password" className="text-xs text-primary hover:text-secondary">
                    {t('forgotPassword')}
                  </Link>
                </div>
                <input
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-secondary disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading || (waitingForRecaptcha && !isRecaptchaReady)}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    {t('loggingIn')}
                  </span>
                ) : (
                  t('loginButton')
                )}
              </button>
              {!isRecaptchaReady && (
                <div className="text-xs text-gray-500 mt-2">
                  {waitingForRecaptcha ? (
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
                        className="text-primary hover:text-secondary underline"
                      >
                        {t('retry') || 'Retry'} ({retryCount + 1}/{maxRetries})
                      </button>
                    </div>
                  ) : (
                    <span className="text-red-600">
                      {t('recaptchaUnavailable') || 'reCAPTCHA unavailable. Please refresh the page.'}
                    </span>
                  )}
                </div>
              )}
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Delegate to existing full register page for now
                window.location.href = '/register';
              }}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {t('name')}
                </label>
                <input
                  type="text"
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {t('surname')}
                </label>
                <input
                  type="text"
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  value={registerData.surname}
                  onChange={(e) => setRegisterData({ ...registerData, surname: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {t('phoneNumber')}
                </label>
                <input
                  type="tel"
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {t('email')}
                </label>
                <input
                  type="email"
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {t('password')}
                </label>
                <input
                  type="password"
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {t('confirmPassword')}
                </label>
                <input
                  type="password"
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  value={registerData.confirmPassword}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, confirmPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {t('role')}
                </label>
                <select
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  value={registerData.role}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, role: e.target.value as 'patient' | 'doctor' })
                  }
                >
                  <option value="patient">{t('patient')}</option>
                  <option value="doctor">{t('doctor')}</option>
                </select>
              </div>

              <button
                type="submit"
                className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-secondary"
              >
                {t('register')}
              </button>
            </form>
          )}

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">{t('orDivider')}</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="text-center text-sm text-gray-700">
            {mode === 'login' ? (
              <>
                <span>{t('noAccount')}</span>{' '}
                <button
                  type="button"
                  className="font-medium text-primary hover:text-secondary"
                  onClick={() => setMode('register')}
                >
                  {t('registerNow')}
                </button>
              </>
            ) : (
              <>
                <span>{t('alreadyHaveAccount')}</span>{' '}
                <button
                  type="button"
                  className="font-medium text-primary hover:text-secondary"
                  onClick={() => setMode('login')}
                >
                  {t('loginTitle')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: text + switch CTA panel */}
        <div className="hidden md:flex w-1/2 flex-col justify-center bg-primary text-white px-10 py-12 gap-4">
          <h3 className="text-3xl font-semibold">
            {mode === 'login' ? t('welcomeBackTitle') ?? 'Welcome back' : t('newHere')}
          </h3>
          <p className="text-sm text-white/80">
            {mode === 'login'
              ? t('loginSideText') ?? 'Sign in to manage your appointments and stay on top of your care.'
              : t('registerSideText') ??
                'Create an account to book appointments and manage your health in one place.'}
          </p>
          <button
            type="button"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-primary hover:bg-violet-50"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? t('registerNow') : t('loginTitle')}
          </button>
        </div>
      </div>
    </div>
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