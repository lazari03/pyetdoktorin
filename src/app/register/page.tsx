'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useTranslation } from 'react-i18next';
import { useDI } from '@/context/DIContext';
import { AuthShell } from '@/presentation/components/auth/AuthShell';

function RegisterPageInner() {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'patient', // Default role
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false); // State to control modal visibility
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

        setLoading(true);
        try {
            await registerUserUseCase.execute({
                name: formData.name,
                surname: formData.surname,
                phone: formData.phone,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            });

            setShowModal(true);
            setTimeout(() => {
                setShowModal(false);
                nav.toLogin();
            }, 3000);
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
        eyebrow={t('secureAccessEyebrow') || 'Secure access'}
        title={t('createCareAccount') || t('register')}
        subtitle={t('onlyNeededData') || 'We only collect what’s needed for your clinician.'}
        highlights={[
          { title: t('secureHighlights1') || 'Medical-grade encryption', body: t('hipaaLine') || 'HIPAA-aware | Encrypted in transit' },
          { title: t('secureHighlights2') || 'Consent-based sharing', body: t('consentLine') || 'We share only with your selected clinicians.' },
          { title: t('secureHighlights3') || 'Role-based access control', body: t('loginSideSecure') || 'Access differs for patients and doctors.' },
        ]}
        rightCta={
          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">{t('alreadyHaveAccount')}</p>
            <Link
              href="/login"
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
            <span>{t('consentLine') || 'I consent to share my health info with my selected clinicians.'}</span>
          </label>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? t('registering') : t('secureRegisterCta') || t('register')}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 mt-2">
          {t('onlyNeededData') || 'We only collect what’s needed for your clinician.'}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center space-y-2">
              <h3 className="text-2xl font-bold">{t('registrationSuccessful')}</h3>
              <p className="text-gray-700">{t('redirectToLoginShortly')}</p>
            </div>
          </div>
        )}
      </AuthShell>
    );
}

export default function RegisterPage() {
    return <RegisterPageInner />;
}
