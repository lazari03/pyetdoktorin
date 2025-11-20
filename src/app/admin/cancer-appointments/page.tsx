'use client';

import Link from 'next/link';
import { AdminHeader } from '@/presentation/components/admin/AdminHeader';

export default function CancerAppointmentsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-base-100">
      <AdminHeader title="Cancer Appointments" />
      <div className="flex-1 space-y-6 p-6">
        <div className="card border shadow-sm">
          <div className="card-body space-y-3">
            <p className="text-xs uppercase tracking-wide text-neutral">Focused ops</p>
            <h2 className="text-xl font-semibold">Cancer screening control center</h2>
            <p className="text-neutral">
              This view highlights oncology-specific scheduling, triage, and reporting workflows. Use the dedicated appointments
              module to filter by screening type, export logs, and monitor risk classifications.
            </p>
            <Link href="/admin/appointments" className="link link-primary">
              Go to Appointments module
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
