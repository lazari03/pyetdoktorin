'use client';

import { AdminHeader } from '@/presentation/components/admin/AdminHeader';

export default function DoctorsAdminPage() {
  return (
    <div className="flex min-h-screen flex-col bg-base-100">
      <AdminHeader title="Doctors" />
      <div className="flex-1 space-y-6 p-6">
        <div className="card border shadow-sm">
          <div className="card-body space-y-2">
            <p className="text-xs uppercase tracking-wide text-neutral">Roster</p>
            <h2 className="text-xl font-semibold">Doctor management workspace</h2>
            <p className="text-neutral">
              Manage credentials, specialties, coverage windows, and permissions for clinical staff. This view complements the
              dashboard user table with a dedicated workspace for clinician oversight.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
