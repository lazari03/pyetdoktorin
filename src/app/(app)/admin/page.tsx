"use client";

import { useTranslation } from 'react-i18next';
import '@i18n';
import { useAdminDashboardStats } from '@/presentation/hooks/useAdminDashboardStats';
import { UsersTable } from './components/UsersTable';
import { UserSidepanel } from './components/UserSidepanel';
import { ToastProvider } from './components/ToastProvider';
import RequestStateGate from '@/presentation/components/RequestStateGate/RequestStateGate';
import { ADMIN_PATHS } from '@/navigation/paths';

const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function AdminPage() {
  const { t } = useTranslation();
  const { stats, loading, error, refresh } = useAdminDashboardStats();

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
      <RequestStateGate
        loading={loading && !stats}
        error={error}
        onRetry={refresh}
        homeHref={ADMIN_PATHS.root}
        loadingLabel={t('loading')}
        analyticsPrefix="admin.dashboard"
      >
        <div className="space-y-4">
          <section className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-xl shadow-sm p-5 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.13em] text-white/70">{t('adminControlCenter') || 'Admin Control Center'}</p>
                <h1 className="text-2xl font-bold mt-1">{t('adminDashboard')}</h1>
                <p className="text-white/80 mt-2 text-[12.5px]">
                  {t('adminDashboardHero') || 'Monitor platform activity, manage users, and review clinic bookings from one place.'}
                </p>
              </div>
              <div className="bg-white/10 rounded-xl px-5 py-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[.1em] text-white/80">{t('revenueThisMonth') || 'Revenue this month'}</p>
                <p className="text-2xl font-extrabold tracking-tight">
                  {stats ? formatter.format(stats.monthlyRevenue ?? 0) : '—'}
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-[11.5px] text-gray-500">{card.label}</p>
                <p className="text-3xl font-extrabold text-gray-900 tracking-tight mt-2">
                  {loading && !stats ? <span className="text-gray-300">—</span> : card.value}
                </p>
                <p className="text-[10.5px] text-gray-400 mt-1">{card.helper}</p>
              </div>
            ))}
          </section>

          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[13.5px] font-bold text-gray-900">{t('users')}</h2>
                <p className="text-[11.5px] text-gray-500">{t('manageUsersHint') || 'Review, edit, and reset access for any account.'}</p>
              </div>
            </div>
            <UsersTable />
            <UserSidepanel />
          </section>
        </div>
      </RequestStateGate>
    </ToastProvider>
  );
}
