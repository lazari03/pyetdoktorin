'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from '@/presentation/components/admin/AdminHeader';
import { Service } from '@/core/domain/service/Service';

export default function AdminDashboardPage() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => setServices(data.services || []))
      .catch(() => setServices([]));
  }, []);

  const connectedCount = services.filter((service) => service.status === 'connected').length;

  return (
    <div className="flex min-h-screen flex-col bg-base-100">
      <AdminHeader title="Dashboard" />
      <div className="flex-1 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card bg-primary text-primary-content">
            <div className="card-body">
              <p className="text-sm uppercase text-primary-content/80">Connected Services</p>
              <p className="text-3xl font-bold">{connectedCount}</p>
              <p className="text-sm">Active integrations</p>
            </div>
          </div>
          <div className="card border">
            <div className="card-body">
              <p className="text-sm uppercase text-neutral">Security</p>
              <p className="text-xl font-semibold">reCAPTCHA</p>
              <p className="text-sm text-neutral">Monitor spam protection status.</p>
            </div>
          </div>
          <div className="card border">
            <div className="card-body">
              <p className="text-sm uppercase text-neutral">Messaging</p>
              <p className="text-xl font-semibold">SMS Alerts</p>
              <p className="text-sm text-neutral">Check Vonage connectivity.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
