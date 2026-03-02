"use client";

import { ToastProvider, useToast } from '../components/ToastProvider';
import { UsersTable } from '../components/UsersTable';
import { UserSidepanel } from '../components/UserSidepanel';
import { useTranslation } from 'react-i18next';
import '@i18n';
import { useState } from 'react';
import { useAdminStore } from '@/store/adminStore';
import { UserRole } from '@/domain/entities/UserRole';
import { trackAnalyticsEvent } from '@/presentation/utils/trackAnalyticsEvent';

const DEFAULT_FORM = {
  name: '',
  surname: '',
  email: '',
  password: '',
  phone: '',
  role: UserRole.Patient,
};

export default function AdminUsersPage() {
  return (
    <ToastProvider>
      <AdminUsersContent />
    </ToastProvider>
  );
}

function AdminUsersContent() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { createManagedUser, loading } = useAdminStore();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    trackAnalyticsEvent('admin_user_create_attempt', { role: form.role });
    try {
      await createManagedUser({
        name: form.name.trim(),
        surname: form.surname.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        role: form.role,
      });
      showToast(t('userCreated') || 'User created', 'success');
      setForm(DEFAULT_FORM);
      trackAnalyticsEvent('admin_user_create_success', { role: form.role });
    } catch (error) {
      const message = error instanceof Error ? error.message : t('createUserFailed') || 'Failed to create user';
      showToast(message, 'error');
      trackAnalyticsEvent('admin_user_create_failed', {
        role: form.role,
        reason: message.slice(0, 120),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div className="space-y-4">
        <div className="bg-white rounded-3xl shadow-lg border border-purple-50 p-6 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('users')}</h1>
            <p className="text-sm text-gray-600">{t('manageUsersHint') || 'Edit roles, reset passwords, and review doctor applications.'}</p>
          </div>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={handleCreate}>
            <label className="text-sm text-gray-700">
              {t('name')}
              <input
                className="mt-1 w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </label>
            <label className="text-sm text-gray-700">
              {t('surname')}
              <input
                className="mt-1 w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm"
                value={form.surname}
                onChange={(e) => handleChange('surname', e.target.value)}
                required
              />
            </label>
            <label className="text-sm text-gray-700">
              Email
              <input
                type="email"
                className="mt-1 w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </label>
            <label className="text-sm text-gray-700">
              {t('phone') || 'Phone'} ({t('optional') || 'optional'})
              <input
                className="mt-1 w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </label>
            <label className="text-sm text-gray-700">
              {t('password') || 'Password'}
              <input
                type="password"
                className="mt-1 w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                minLength={8}
                required
              />
            </label>
            <label className="text-sm text-gray-700">
              {t('role')}
              <select
                className="mt-1 w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm"
                value={form.role}
                onChange={(e) => handleChange('role', e.target.value as UserRole)}
              >
                <option value={UserRole.Patient}>{t('patientRole') || 'Patient'}</option>
                <option value={UserRole.Clinic}>{t('clinicRole') || 'Clinic'}</option>
                <option value={UserRole.Pharmacy}>{t('pharmacyRole') || 'Pharmacy'}</option>
                <option value={UserRole.Admin}>{t('adminRole') || 'Admin'}</option>
              </select>
            </label>
            <div className="md:col-span-2 flex flex-wrap gap-2">
              <button
                type="submit"
                className="rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-60"
                disabled={submitting || loading}
              >
                {submitting ? t('creatingUser') || 'Creating...' : t('createUser') || 'Create user'}
              </button>
            </div>
          </form>
        </div>
        <div className="bg-white rounded-3xl shadow-lg border border-purple-50 p-5">
          <UsersTable />
        </div>
        <UserSidepanel />
      </div>
  );
}
