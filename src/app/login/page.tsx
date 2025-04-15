'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { login } from '../../services/authService';
import { testFirebaseConnection } from '../../services/firebaseTest';

function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const searchParams = useSearchParams();

  // Get the 'from' parameter to redirect after login
  const fromPath = searchParams?.get('from') || '/dashboard';

  // Test Firebase connectivity on component mount, but don't block login if it fails
  useEffect(() => {
    testFirebaseConnection().catch((error: Error) => {
      console.error('Firebase connection test failed:', error.message);
      setErrorMsg('Warning: Firebase connection issues detected. Some features may be limited.');
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
  
    try {
      if (!navigator.onLine) {
        throw new Error('You are offline. Please check your internet connection and try again.');
      }
  
      const { user, role } = await login(email, password);
      console.log('Login success - User:', user.email, 'Role:', role);
  
      // Verify if the 'auth-token' cookie is set
      if (!document.cookie.includes('auth-token=')) {
        console.error('Auth token cookie was not set');
        setErrorMsg('Warning: Authentication token not set properly. Try again or contact support.');
        setLoading(false);
        return;
      }
  
      window.location.href = fromPath;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Login failed:', errorMessage);
      setErrorMsg(errorMessage);
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

          <h2 className="card-title text-2xl font-bold text-center mx-auto mb-4 text-gray-800">Login</h2>

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
                <span className="label-text text-gray-700">Email</span>
              </label>
              <input
                type="email"
                placeholder="your.email@example.com"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text text-gray-700">Password</span>
                <Link href="/forgot-password" className="label-text-alt link link-hover text-primary">
                  Forgot password?
                </Link>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full mt-2 ${loading ? 'loading' : ''}`}
              disabled={loading}
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
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="divider my-6">OR</div>

          <div className="text-center">
            <p className="mb-2 text-gray-700">Don&apos;t have an account?</p>
            <Link href="/register" className="btn btn-outline btn-wide">
              Register Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}