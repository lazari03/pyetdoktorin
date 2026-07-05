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
import { notifyFormSubmission } from '@/presentation/utils/formNotifications';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

const DEFAULT_FORM = {
  name: '',
  surname: '',
  email: '',
  password: '',
  phone: '',
  role: UserRole.Patient,
};

const ROLE_FILTERS: { label: string; value: string | null }[] = [
  { label: 'All', value: null },
  { label: 'Patient', value: UserRole.Patient },
  { label: 'Doctor', value: UserRole.Doctor },
  { label: 'Clinic', value: UserRole.Clinic },
  { label: 'Pharmacy', value: UserRole.Pharmacy },
  { label: 'Admin', value: UserRole.Admin },
];

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
  const [panelOpen, setPanelOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

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
      void notifyFormSubmission({
        formType: 'admin_user_create',
        source: 'admin_users_page',
        subject: `Managed user created: ${form.email.trim()}`,
        replyTo: form.email.trim(),
        data: {
          name: form.name.trim(),
          surname: form.surname.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          role: form.role,
          password: '[redacted]',
        },
      });
      showToast(t('userCreated') || 'User created', 'success');
      setForm(DEFAULT_FORM);
      setPanelOpen(false);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('users')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {t('manageUsersHint') || 'Edit roles, reset passwords, and review doctor applications.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPanelOpen((o) => !o)}
          className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500 shadow-sm"
          data-analytics="admin.users.new_user"
        >
          <PlusIcon className="h-4 w-4" />
          {t('createUser') || 'New user'}
        </button>
      </div>

      {/* Role filter pills */}
      <div className="flex flex-wrap gap-2">
        {ROLE_FILTERS.map((f) => (
          <button
            key={f.value ?? 'all'}
            type="button"
            onClick={() => setRoleFilter(f.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              roleFilter === f.value
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Split layout */}
      <div className={`flex gap-4 items-start ${panelOpen ? 'lg:flex-row' : ''}`}>
        {/* Table */}
        <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-4 min-w-0 ${panelOpen ? 'flex-1' : 'w-full'}`}>
          <UsersTable roleFilter={roleFilter ?? undefined} />
        </div>

        {/* Create panel */}
        {panelOpen && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 w-full lg:w-[380px] shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">{t('createUser') || 'New user'}</h2>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close panel"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form className="space-y-3" onSubmit={handleCreate}>
              <label className="block text-sm text-gray-700">
                {t('name')}
                <input
                  className="mt-1 w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </label>
              <label className="block text-sm text-gray-700">
                {t('surname')}
                <input
                  className="mt-1 w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm"
                  value={form.surname}
                  onChange={(e) => handleChange('surname', e.target.value)}
                  required
                />
              </label>
              <label className="block text-sm text-gray-700">
                Email
                <input
                  type="email"
                  className="mt-1 w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </label>
              <label className="block text-sm text-gray-700">
                {t('phone') || 'Phone'} ({t('optional') || 'optional'})
                <input
                  className="mt-1 w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </label>
              <label className="block text-sm text-gray-700">
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
              <label className="block text-sm text-gray-700">
                {t('role')}
                <select
                  className="mt-1 w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm"
                  value={form.role}
                  onChange={(e) => handleChange('role', e.target.value as UserRole)}
                >
                  <option value={UserRole.Patient}>{t('patientRole') || 'Patient'}</option>
                  <option value={UserRole.Doctor}>{t('doctorRole') || 'Doctor'}</option>
                  <option value={UserRole.Clinic}>{t('clinicRole') || 'Clinic'}</option>
                  <option value={UserRole.Pharmacy}>{t('pharmacyRole') || 'Pharmacy'}</option>
                  <option value={UserRole.Admin}>{t('adminRole') || 'Admin'}</option>
                </select>
              </label>
              <button
                type="submit"
                className="w-full rounded-full bg-purple-600 py-2 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-60 mt-1"
                disabled={submitting || loading}
              >
                {submitting ? t('creatingUser') || 'Creating...' : t('createUser') || 'Create user'}
              </button>
            </form>
          </div>
        )}
      </div>

      <UserSidepanel />
    </div>
  );
}

