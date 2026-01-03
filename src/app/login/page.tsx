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

function LoginPageContent() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
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
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-center mb-6">
            <div className="w-48">
              <Link href="/">
                <Image
                  src="/img/logo.png"
                  alt="Portokalle"
                  width={200}
                  height={100}
                  className="w-full h-auto"
                />
              </Link>
            </div>
          </div>

          <h2 className="card-title text-2xl font-bold text-center mx-auto mb-4 text-gray-800">{t('loginTitle')}</h2>

          {errorMsg && (
            <div className="alert alert-error mt-4">
              <span>{errorMsg}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin(e);
            }}
            className="form-control gap-4"
          >
            <div>
              <label className="label">
                <span className="label-text text-gray-700">{t('email')}</span>
              </label>
              <input
                type="email"
                placeholder={t('emailPlaceholder')}
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text text-gray-700">{t('password')}</span>
                <Link href="/forgot-password" className="label-text-alt link link-hover text-primary">
                  {t('forgotPassword')}
                </Link>
              </label>
              <input
                type="password"
                placeholder={t('passwordPlaceholder')}
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full mt-2 ${loading ? 'loading' : ''}`}
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
              <div className="text-sm text-gray-500 mt-2">{t('recaptchaLoading')}</div>
            )}
          </form>

          <div className="divider my-6">{t('orDivider')}</div>

          <div className="text-center">
            <p className="mb-2 text-gray-700">{t('noAccount')}</p>
            <Link href="/register" className="btn btn-outline btn-wide">
              {t('registerNow')}
            </Link>
          </div>
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