"use client";

import RedirectingModal from '@/presentation/components/RedirectingModal/RedirectingModal';
import RoleGuard from '@/presentation/components/RoleGuard/RoleGuard';
import AppointmentsTable from '@/presentation/components/AppointmentsTable/AppointmentsTable';
import { useAppointmentsViewModel } from '@/presentation/view-models/useAppointmentsViewModel';

function AppointmentsPage() {
  const vm = useAppointmentsViewModel();

  return (
    <div className="min-h-screen bg-transparent">
      <RedirectingModal show={vm.showRedirecting} />
      <div className="mx-auto max-w-6xl px-4 py-6 lg:py-10">
        {/* Header aligned with dashboard style */}
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
            Your Appointments
          </h2>
        </header>

        {/* Table card matching new dashboard UI */}
        <section className="dashboard-table-card">
          <div className="px-4 sm:px-6 pt-4 pb-4">
            <AppointmentsTable
              appointments={vm.appointments}
              role={vm.userRole}
              isAppointmentPast={vm.isAppointmentPast}
              handleJoinCall={vm.handleJoinCall}
              handlePayNow={vm.handlePayNow}
              showActions={true}
              maxRows={100}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export default function ProtectedAppointmentsPage() {
  return (
    <RoleGuard allowedRoles={['doctor', 'patient']}>
      <AppointmentsPage />
    </RoleGuard>
  );
}
