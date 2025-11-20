'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/services', label: 'Services' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-base-200/60 p-4">
      <div className="mb-6 text-lg font-semibold">Admin Panel</div>
      <nav className="space-y-2">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition hover:bg-base-300 ${active ? 'bg-primary text-primary-content' : ''}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
