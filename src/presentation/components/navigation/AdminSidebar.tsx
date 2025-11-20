'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChartPieIcon,
  Cog6ToothIcon,
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

const links = [
  { href: '/admin', label: 'Dashboard', icon: HomeIcon },
  { href: '/admin/users', label: 'Users', icon: UsersIcon },
  { href: '/admin/doctors', label: 'Doctors', icon: HeartIcon },
  { href: '/admin/patients', label: 'Patients', icon: UserGroupIcon },
  { href: '/admin/appointments', label: 'Appointments', icon: CalendarDaysIcon },
  { href: '/admin/cancer-appointments', label: 'Cancer Appointments', icon: HeartIcon },
  { href: '/admin/analytics', label: 'Analytics', icon: ChartPieIcon },
  { href: '/admin/settings', label: 'Settings', icon: Cog6ToothIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 border-r bg-base-200/60 p-4">
      <div className="mb-6 text-lg font-semibold">Admin Panel</div>
      <nav className="space-y-2">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition hover:bg-base-300 ${active ? 'bg-primary text-primary-content' : 'text-base-content'}`}
            >
              <Icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
