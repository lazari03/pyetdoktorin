'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from '@/presentation/components/admin/AdminHeader';
import { ServiceCard } from '@/presentation/components/admin/ServiceCard';
import { Service } from '@/core/domain/service/Service';

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      setServices(data.services || []);
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleConnect = async (serviceId: string) => {
    setLoading(true);
    try {
      await fetch('/api/services/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId }),
      });
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (serviceId: string) => {
    setLoading(true);
    try {
      await fetch('/api/services/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId }),
      });
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-base-100">
      <AdminHeader title="Services" />
      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Integrations</h2>
            <p className="text-sm text-neutral">Manage service connections and integrations.</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={refresh} disabled={loading}>
            Refresh
          </button>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} onConnect={handleConnect} onDisconnect={handleDisconnect} />
          ))}
        </div>
        {services.length === 0 && !loading && <p className="text-sm text-neutral">No services configured.</p>}
      </div>
    </div>
  );
}
