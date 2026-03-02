"use client";

import { useTranslation } from 'react-i18next';
import '@i18n';
import { useAdminDashboardStats } from '@/presentation/hooks/useAdminDashboardStats';
import { UsersTable } from './components/UsersTable';
import { UserSidepanel } from './components/UserSidepanel';
import { ToastProvider } from './components/ToastProvider';

const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function AdminPage() {
  const { t } = useTranslation();
  const { stats, loading } = useAdminDashboardStats();

  const cards = [
    {
      label: t('totalAppointments') || 'Total appointments',
      value: stats?.totalAppointments ?? '—',
      helper: t('allTime') || 'All time',
    },
    {
      label: t('totalPrescriptions') || 'Prescriptions issued',
      value: stats?.totalRecipes ?? '—',
      helper: t('generatedAcrossDoctors') || 'Generated across doctors',
    },
    {
      label: t('clinicBookings') || 'Clinic bookings',
      value: stats?.totalClinicBookings ?? '—',
      helper: t('privateClinics') || 'Private clinics',
    },
    {
      label: t('totalUsers') || 'Total users',
      value: stats?.totalUsers ?? '—',
      helper: t('registeredAccounts') || 'Registered accounts',
    },
  ];

  return (
    <ToastProvider>
      <div className="space-y-6">
        <section className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-500 rounded-3xl shadow-lg p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-white/70">{t('adminControlCenter') || 'Admin Control Center'}</p>
              <h1 className="text-3xl font-bold mt-1">{t('adminDashboard')}</h1>
              <p className="text-white/80 mt-2 text-sm">
                {t('adminDashboardHero') || 'Monitor platform activity, manage users, and review clinic bookings from one place.'}
              </p>
            </div>
            <div className="bg-white/10 rounded-2xl px-5 py-4 text-center">
              <p className="text-xs uppercase tracking-wide text-white/80">{t('revenueThisMonth') || 'Revenue this month'}</p>
              <p className="text-2xl font-bold">
                {stats ? formatter.format(stats.monthlyRevenue ?? 0) : '—'}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="bg-white rounded-2xl shadow-md border border-purple-50 p-5">
              <p className="text-xs uppercase tracking-wide text-gray-500">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading && !stats ? <span className="text-gray-400">…</span> : card.value}
              </p>
              <p className="text-xs text-gray-500 mt-1">{card.helper}</p>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-3xl shadow-lg border border-purple-50 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t('users')}</h2>
              <p className="text-sm text-gray-600">{t('manageUsersHint') || 'Review, edit, and reset access for any account.'}</p>
            </div>
          </div>
          <UsersTable />
          <UserSidepanel />
        </section>
      </div>
    </ToastProvider>
  );
}
