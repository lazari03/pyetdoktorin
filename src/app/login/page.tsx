'use client';

import { useState, useEffect, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n/i18n';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import Image from 'next/image';
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

function LoginPageContent() {
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
  const isRecaptchaReady = !!executeRecaptcha;

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
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{t('password')}</span>
                <Link href="/forgot-password" className="text-xs text-teal-700 hover:text-teal-800">
                  {t('forgotPassword')}
                </Link>
              </div>
              <input
                type="password"
                placeholder={t('passwordPlaceholder')}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading || !isRecaptchaReady}
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
              <div className="text-xs text-gray-500 mt-2">{t('recaptchaLoading')}</div>
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
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {t('role')}
                </label>
                <select
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
                className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-teal-700"
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
                  className="font-medium text-teal-700 hover:text-teal-800"
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
                  className="font-medium text-teal-700 hover:text-teal-800"
                  onClick={() => setMode('login')}
                >
                  {t('loginTitle')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: text + switch CTA panel */}
        <div className="hidden md:flex w-1/2 flex-col justify-center bg-teal-700 text-teal-50 px-10 py-12 gap-4">
          <h3 className="text-3xl font-semibold">
            {mode === 'login' ? t('welcomeBackTitle') ?? 'Welcome back' : t('newHere')}
          </h3>
          <p className="text-sm text-teal-100">
            {mode === 'login'
              ? t('loginSideText') ?? 'Sign in to manage your appointments and stay on top of your care.'
              : t('registerSideText') ?? 'Create an account to book appointments and manage your health in one place.'}
          </p>
          <button
            type="button"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50"
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
  const pathname = usePathname();
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
      scriptProps={{ async: true, appendTo: "head" }}
      // Force re-mount on route changes to avoid stuck loading cases
      key={pathname}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <LoginPageContent />
      </Suspense>
    </GoogleReCaptchaProvider>
  );
}