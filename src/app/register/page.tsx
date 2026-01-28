'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useTranslation } from 'react-i18next';
import { useDI } from '@/context/DIContext';

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
    const { executeRecaptcha } = useGoogleReCaptcha();
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
            if (!executeRecaptcha) {
                throw new Error('reCAPTCHA not ready');
            }
            // Get reCAPTCHA token
            const token = await executeRecaptcha("register");
            // Verify token with backend
            const recaptchaRes = await fetch("/api/verify-recaptcha", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });
            const recaptchaData = await recaptchaRes.json();
            if (!recaptchaData.success) {
                setError(t('recaptchaFailed'));
                setLoading(false);
                return;
            }
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
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="w-full max-w-5xl bg-white shadow-md rounded-xl overflow-hidden flex flex-col md:flex-row">
                {/* LEFT: intro / CTA column */}
                <div className="hidden md:flex w-1/2 flex-col justify-center bg-teal-700 text-teal-50 px-10 py-12 gap-4">
                    <h2 className="text-3xl font-semibold">{t('register')}</h2>
                    <p className="text-sm text-teal-100">
                        {t('registerIntroText') ?? 'Create your account to book and manage your appointments in one calm, secure place.'}
                    </p>
                    <p className="text-xs text-teal-100/80">
                        {t('registerBenefitsText') ?? 'One account for all your clinicians, appointments and health needs.'}
                    </p>
                </div>

                {/* RIGHT: form column */}
                <div className="w-full md:w-1/2 px-6 py-8 sm:px-8 sm:py-10">
                    <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">{t('register')}</h2>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-900">
                                {t('name')}
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder={t('yourName')}
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-900">
                                {t('surname')}
                            </label>
                            <input
                                type="text"
                                name="surname"
                                placeholder={t('yourSurname')}
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                value={formData.surname}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-900">
                                {t('phoneNumber')}
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder={t('yourPhoneNumber')}
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-900">
                                {t('email')}
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder={t('yourEmailPlaceholder')}
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-900">
                                {t('password')}
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-900">
                                {t('confirmPassword')}
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••••"
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-900">
                                {t('role')}
                            </label>
                            <select
                                name="role"
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="patient">{t('patient')}</option>
                                <option value="doctor">{t('doctor')}</option>
                            </select>
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <button
                            type="submit"
                            className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? t('registering') : t('register')}
                        </button>
                    </form>

                    <div className="my-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-gray-200" />
                        <span className="text-xs text-gray-500 uppercase tracking-wide">{t('or')}</span>
                        <div className="h-px flex-1 bg-gray-200" />
                    </div>

                    <div className="text-center">
                        <p className="mb-2 text-gray-900">{t('alreadyHaveAccount')}</p>
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center rounded-lg border border-teal-600 px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50"
                        >
                            {t('backToLogin')}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h3 className="text-2xl font-bold mb-4">{t('registrationSuccessful')}</h3>
                        <p className="text-gray-700">{t('redirectToLoginShortly')}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function RegisterPage() {
    return (
        <GoogleReCaptchaProvider
            reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            scriptProps={{ async: true, appendTo: "head" }}
        >
            <RegisterPageInner />
        </GoogleReCaptchaProvider>
    );
}
