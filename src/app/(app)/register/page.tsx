'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useTranslation } from 'react-i18next';
import { useDI } from '@/context/DIContext';
import { AuthShell } from '@/presentation/components/auth/AuthShell';
import { ROUTES } from '@/config/routes';
import { DASHBOARD_PATHS } from '@/navigation/paths';
import { establishSessionForCurrentUserAllowUnverified } from '@/infrastructure/services/authService';
import { notifyFormSubmission } from '@/presentation/utils/formNotifications';

function RegisterPageInner() {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        phone: '',
        address: '',
        country: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'patient', // Default role
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const nav = useNavigationCoordinator();
    const { registerUserUseCase } = useDI();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError(t('passwordsDoNotMatch'));
            return;
        }

        setError('');
        setLoading(true);
        try {
            const payload = {
                name: formData.name.trim(),
                surname: formData.surname.trim(),
                phone: formData.phone.trim(),
                address: formData.address.trim(),
                country: formData.country.trim(),
                email: formData.email.trim(),
                password: formData.password,
                role: formData.role,
            };

            await registerUserUseCase.execute({
                ...payload,
            });

            void notifyFormSubmission({
                formType: 'user_registration',
                source: 'register_page',
                subject: `New registration: ${payload.email}`,
                replyTo: payload.email,
                data: {
                    name: payload.name,
                    surname: payload.surname,
                    phone: payload.phone,
                    address: payload.address,
                    country: payload.country,
                    email: payload.email,
                    role: payload.role,
                    password: '[redacted]',
                    consent: true,
                },
            });

            await establishSessionForCurrentUserAllowUnverified();
            nav.replacePath(DASHBOARD_PATHS.root);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : t('failedToRegisterUser')
            );
        } finally {
            setLoading(false);
        }
    };

    return (
      <AuthShell
        eyebrow={t('secureAccessEyebrow')}
        title={t('createCareAccount')}
        subtitle={t('onlyNeededData')}
        highlights={[
          { title: t('secureHighlights1'), body: t('hipaaLine') },
          { title: t('secureHighlights2'), body: t('consentLine') },
          { title: t('secureHighlights3'), body: t('loginSideSecure') },
        ]}
        rightCta={
          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">{t('alreadyHaveAccount')}</p>
            <Link
              href={ROUTES.LOGIN}
              className="inline-flex items-center justify-center rounded-full bg-white text-purple-700 px-4 py-2 text-sm font-semibold hover:bg-purple-50"
            >
              {t('backToLogin')}
            </Link>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-700">{t('name')}</label>
              <input
                type="text"
                name="name"
                placeholder={t('yourName')}
                className="block w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-700">{t('surname')}</label>
              <input
                type="text"
                name="surname"
                placeholder={t('yourSurname')}
                className="block w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={formData.surname}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-700">{t('phoneNumber')}</label>
              <input
                type="tel"
                name="phone"
                placeholder={t('yourPhoneNumber')}
                className="block w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-700">{t('email')}</label>
              <input
                type="email"
                name="email"
                placeholder={t('yourEmailPlaceholder')}
                className="block w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block mb-1 text-xs font-medium text-gray-700">{t('address')}</label>
              <input
                type="text"
                name="address"
                placeholder={t('yourAddress')}
                autoComplete="street-address"
                className="block w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-700">{t('country')}</label>
              <input
                type="text"
                name="country"
                placeholder={t('yourCountry')}
                autoComplete="country-name"
                className="block w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-700">{t('password')}</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="block w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-700">{t('confirmPassword')}</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                className="block w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-700">{t('role')}</label>
              <select
                name="role"
                className="block w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="patient">{t('patient')}</option>
                <option value="doctor">{t('doctor')}</option>
              </select>
            </div>
          </div>

          <label className="flex items-start gap-2 text-xs text-gray-700">
            <input
              type="checkbox"
              required
              className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span>{t('consentLine')}</span>
          </label>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? t('registering') : t('secureRegisterCta')}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 mt-2">
          {t('onlyNeededData')}
        </div>

      </AuthShell>
    );
}

export default function RegisterPage() {
    return <RegisterPageInner />;
}
