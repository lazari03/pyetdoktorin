'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useTranslation } from 'react-i18next';
import { useDI } from '@/context/DIContext';
import { AuthShell } from '@/presentation/components/auth/AuthShell';
import { ROUTES } from '@/config/routes';
import { DASHBOARD_PATHS } from '@/navigation/paths';
import { notifyFormSubmission } from '@/presentation/utils/formNotifications';
import { trackAnalyticsEvent } from '@/presentation/utils/trackAnalyticsEvent';

const inputClass = 'block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500';
const fieldLabelClass = 'block mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500';

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
    const { registerUserUseCase, establishSessionAllowUnverifiedUseCase } = useDI();

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
        trackAnalyticsEvent('register_attempt', { role: formData.role });
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

            await establishSessionAllowUnverifiedUseCase.execute();
            trackAnalyticsEvent('register_success', { role: payload.role });
            nav.replacePath(DASHBOARD_PATHS.root);
        } catch (error) {
            trackAnalyticsEvent('register_failed', { role: formData.role });
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
        maxWidthClassName="max-w-2xl"
        highlights={[
          { title: t('secureHighlights1'), body: t('hipaaLine') },
          { title: t('secureHighlights2'), body: t('consentLine') },
          { title: t('secureHighlights3'), body: t('loginSideSecure') },
        ]}
        rightCta={
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
            <p className="text-sm font-semibold text-gray-900">{t('alreadyHaveAccount')}</p>
            <Link
              href={ROUTES.LOGIN}
              className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors shrink-0"
            >
              {t('backToLogin')}
            </Link>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={fieldLabelClass}>{t('name')}</label>
              <input
                type="text"
                name="name"
                placeholder={t('yourName')}
                className={inputClass}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className={fieldLabelClass}>{t('surname')}</label>
              <input
                type="text"
                name="surname"
                placeholder={t('yourSurname')}
                className={inputClass}
                value={formData.surname}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={fieldLabelClass}>{t('phoneNumber')}</label>
              <input
                type="tel"
                name="phone"
                placeholder={t('yourPhoneNumber')}
                className={inputClass}
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className={fieldLabelClass}>{t('email')}</label>
              <input
                type="email"
                name="email"
                placeholder={t('yourEmailPlaceholder')}
                className={inputClass}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className={fieldLabelClass}>{t('address')}</label>
              <input
                type="text"
                name="address"
                placeholder={t('yourAddress')}
                autoComplete="street-address"
                className={inputClass}
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className={fieldLabelClass}>{t('country')}</label>
              <input
                type="text"
                name="country"
                placeholder={t('yourCountry')}
                autoComplete="country-name"
                className={inputClass}
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={fieldLabelClass}>{t('password')}</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className={inputClass}
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className={fieldLabelClass}>{t('confirmPassword')}</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                className={inputClass}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="sm:max-w-[calc(50%-0.375rem)]">
            <label className={fieldLabelClass}>{t('role')}</label>
            <select
              name="role"
              className={inputClass}
              value={formData.role}
              onChange={handleChange}
            >
              <option value="patient">{t('patient')}</option>
              <option value="doctor">{t('doctor')}</option>
            </select>
          </div>

          <label className="flex items-start gap-2 text-xs text-gray-700">
            <input
              type="checkbox"
              required
              className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span>{t('consentLine')}</span>
          </label>

          {error && (
            <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            data-analytics="auth.register.submit"
            className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? t('registering') : t('secureRegisterCta')}
          </button>
        </form>
      </AuthShell>
    );
}

export default function RegisterPage() {
    return <RegisterPageInner />;
}
