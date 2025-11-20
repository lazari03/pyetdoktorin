'use client';

import { AdminHeader } from '@/presentation/components/admin/AdminHeader';

export default function AdminSettingsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-base-100">
      <AdminHeader title="Settings" />
      <div className="flex-1 space-y-6 p-6">
        <div className="card border shadow-sm">
          <div className="card-body space-y-2">
            <p className="text-xs uppercase tracking-wide text-neutral">Configuration</p>
            <h2 className="text-xl font-semibold">Platform controls</h2>
            <p className="text-neutral">
              Configure access policies, notifications, and integrations. Pair this with the services view to validate external
              connectivity like reCAPTCHA, SMS, and EHR links.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
