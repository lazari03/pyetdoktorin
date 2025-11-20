'use client';

import { AdminHeader } from '@/presentation/components/admin/AdminHeader';

export default function PatientsAdminPage() {
  return (
    <div className="flex min-h-screen flex-col bg-base-100">
      <AdminHeader title="Patients" />
      <div className="flex-1 space-y-6 p-6">
        <div className="card border shadow-sm">
          <div className="card-body space-y-2">
            <p className="text-xs uppercase tracking-wide text-neutral">Registry</p>
            <h2 className="text-xl font-semibold">Patient coordination workspace</h2>
            <p className="text-neutral">
              Track demographics, consent, communication preferences, and care team assignments. Patient operations align with the
              global user directory for quick access to onboarding and eligibility decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
