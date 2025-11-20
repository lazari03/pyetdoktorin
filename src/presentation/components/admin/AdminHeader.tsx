'use client';

import { useAuth } from '@/context/AuthContext';

export function AdminHeader({ title }: { title: string }) {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between border-b bg-base-100 px-6 py-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-neutral">Admin</p>
        <h1 className="text-2xl font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-3 rounded-md bg-base-200 px-3 py-2 text-sm">
        <span className="font-medium">{user?.name || 'Admin User'}</span>
      </div>
    </header>
  );
}
