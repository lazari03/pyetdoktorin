'use client';

import { Service } from '@/core/domain/service/Service';

interface Props {
  service: Service;
  onConnect: (serviceId: string) => Promise<void>;
  onDisconnect: (serviceId: string) => Promise<void>;
}

export function ServiceCard({ service, onConnect, onDisconnect }: Props) {
  const statusStyles = {
    connected: 'badge-success',
    disconnected: 'badge-neutral',
    error: 'badge-error',
  } as const;

  return (
    <div className="card border bg-base-100 shadow-sm">
      <div className="card-body space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{service.name}</h3>
            <p className="text-sm text-neutral">{service.description}</p>
          </div>
          <span className={`badge ${statusStyles[service.status]}`}>{service.status}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-neutral">
          {service.category && <span className="badge badge-outline">{service.category}</span>}
          {service.connectedAt && <span>Connected {new Date(service.connectedAt).toLocaleString()}</span>}
        </div>
        <div className="card-actions justify-end">
          {service.status === 'connected' ? (
            <button className="btn btn-outline btn-sm" onClick={() => onDisconnect(service.id)}>
              Disconnect
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => onConnect(service.id)}>
              Connect
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
