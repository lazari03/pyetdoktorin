'use client';

import { useMemo, useState } from 'react';
import { AdminHeader } from '@/presentation/components/admin/AdminHeader';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

type UserRole = 'doctor' | 'patient' | 'admin';
type UserStatus = 'active' | 'disabled' | 'invited';

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
  assignedDoctor?: string;
};

const users: User[] = [
  {
    id: 'U-1001',
    name: 'Dr. Maya Patel',
    email: 'maya.patel@clinic.com',
    role: 'doctor',
    status: 'active',
    lastLogin: 'Today 08:35',
  },
  {
    id: 'U-1002',
    name: 'Michael Chen',
    email: 'michael.chen@patient.com',
    role: 'patient',
    status: 'active',
    lastLogin: 'Yesterday 21:14',
    assignedDoctor: 'Dr. Maya Patel',
  },
  {
    id: 'U-1003',
    name: 'Dr. Sofia Hernandez',
    email: 'sofia.h@clinic.com',
    role: 'doctor',
    status: 'active',
    lastLogin: 'Today 09:02',
  },
  {
    id: 'U-1004',
    name: 'Daniel Murphy',
    email: 'daniel.m@patient.com',
    role: 'patient',
    status: 'disabled',
    lastLogin: '2 days ago',
    assignedDoctor: 'Dr. Sofia Hernandez',
  },
  {
    id: 'U-1005',
    name: 'Ava Thompson',
    email: 'ava.thompson@patient.com',
    role: 'patient',
    status: 'invited',
    lastLogin: 'Not yet',
  },
];

const summaryCards = [
  {
    label: 'Total Users',
    value: '1,248',
    change: '+8.4% vs last week',
  },
  {
    label: 'Total Patients',
    value: '980',
    change: '+21 new signups',
  },
  {
    label: 'Total Doctors',
    value: '142',
    change: '3 pending invitations',
  },
  {
    label: 'Active Sessions',
    value: '64',
    change: 'Across web & mobile',
  },
];

export default function AdminDashboardPage() {
  const [filter, setFilter] = useState<'all' | UserRole>('all');
  const [sortKey, setSortKey] = useState<keyof User>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredUsers = useMemo(() => {
    const scoped = filter === 'all' ? users : users.filter((user) => user.role === filter);

    return [...scoped].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filter, sortDirection, sortKey]);

  const handleSort = (key: keyof User) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    const map = {
      active: 'badge-success',
      disabled: 'badge-error',
      invited: 'badge-ghost',
    } as const;

    return <span className={`badge badge-sm ${map[status]}`}>{status}</span>;
  };

  return (
    <div className="flex min-h-screen flex-col bg-base-100">
      <AdminHeader title="Dashboard" />

      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div key={card.label} className="card border shadow-sm">
              <div className="card-body space-y-2">
                <p className="text-xs uppercase tracking-wide text-neutral">{card.label}</p>
                <p className="text-3xl font-semibold">{card.value}</p>
                <p className="text-sm text-success">{card.change}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card border shadow-sm">
          <div className="card-body space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral">User Directory</p>
                <h2 className="text-xl font-semibold">People & Access</h2>
              </div>
              <div className="join">
                {['all', 'doctor', 'patient'].map((role) => (
                  <button
                    key={role}
                    className={`btn btn-sm join-item ${filter === role ? 'btn-primary text-primary-content' : 'btn-ghost'}`}
                    onClick={() => setFilter(role as 'all' | UserRole)}
                  >
                    {role === 'all' ? 'All Users' : role.charAt(0).toUpperCase() + role.slice(1) + 's'}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <table className="table table-zebra w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-neutral">
                    {['id', 'name', 'email', 'role', 'status', 'lastLogin'].map((key) => (
                      <th key={key} className="cursor-pointer" onClick={() => handleSort(key as keyof User)}>
                        <div className="flex items-center gap-2">
                          <span>{key === 'lastLogin' ? 'Last login' : key}</span>
                          {sortKey === key && <span className="text-[10px] text-primary">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                        </div>
                      </th>
                    ))}
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover">
                      <td className="font-mono text-xs">{user.id}</td>
                      <td className="font-medium">{user.name}</td>
                      <td className="text-neutral">{user.email}</td>
                      <td className="capitalize">{user.role}</td>
                      <td>{getStatusBadge(user.status)}</td>
                      <td>{user.lastLogin}</td>
                      <td>
                        <div className="flex items-center justify-end gap-2 text-xs">
                          <button className="btn btn-ghost btn-xs">View</button>
                          <button className="btn btn-ghost btn-xs">Edit</button>
                          <button className="btn btn-ghost btn-xs">{user.status === 'disabled' ? 'Enable' : 'Disable'}</button>
                          <button className="btn btn-error btn-xs text-white">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-lg border p-4 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase text-neutral">Team Load</p>
                    <h3 className="text-lg font-semibold">Doctor & Patient Breakdown</h3>
                  </div>
                  <EllipsisVerticalIcon className="h-5 w-5 text-neutral" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Doctors</span>
                      <span className="badge badge-primary badge-outline">142</span>
                    </div>
                    <p className="text-neutral">Average caseload: 18 patients</p>
                    <div className="h-2 rounded-full bg-base-200">
                      <div className="h-full w-[72%] rounded-full bg-primary" />
                    </div>
                  </div>
                  <div className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Patients</span>
                      <span className="badge badge-secondary badge-outline">980</span>
                    </div>
                    <p className="text-neutral">High-risk cohort: 64 patients</p>
                    <div className="h-2 rounded-full bg-base-200">
                      <div className="h-full w-[48%] rounded-full bg-secondary" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3 rounded-lg border p-4">
                <p className="text-xs uppercase text-neutral">Recent Activity</p>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">New patient onboarded</p>
                    <p className="text-neutral">Ava Thompson • assigned to Dr. Hernandez</p>
                  </div>
                  <div>
                    <p className="font-medium">Cancer screening report uploaded</p>
                    <p className="text-neutral">By Dr. Patel • flagged as low-risk</p>
                  </div>
                  <div>
                    <p className="font-medium">User disabled</p>
                    <p className="text-neutral">Daniel Murphy by Admin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
