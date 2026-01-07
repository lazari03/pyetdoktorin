'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useInitializeAppointments } from '../../store/appointmentStore';
import { useDI } from '@/context/DIContext';
import { useAuth } from '@/context/AuthContext';
import { getNavigationPaths, NavigationKey } from '@/store/navigationStore';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const { role, loading, isAuthenticated, user } = useAuth();
  const { fetchAppointmentsUseCase } = useDI();
  const initializeAppointments = useInitializeAppointments((userId: string, isDoctor: boolean) =>
    fetchAppointmentsUseCase.execute(userId, isDoctor),
  );

  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current && isAuthenticated && role && user && initializeAppointments) {
      const isDoctor = role === 'doctor';
      initializeAppointments(user.uid, isDoctor);
      initializedRef.current = true;
    }
  }, [isAuthenticated, role, user, initializeAppointments]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js');
    }
  }, []);

  const nav = useNavigationCoordinator();
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      nav.toLogin(pathname ?? undefined);
    }
  }, [loading, isAuthenticated, pathname, nav]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!role) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  const isAdminSection = pathname?.startsWith('/admin');
  const navPaths = isAdminSection
    ? [
        { key: NavigationKey.Dashboard, name: 'dashboard', href: '/admin' },
        { key: NavigationKey.Appointments, name: 'users', href: '/admin/users' },
        { key: NavigationKey.AppointmentHistory, name: 'notifications', href: '/admin/notifications' },
        { key: NavigationKey.Profile, name: 'stats', href: '/admin/stats' },
      ]
    : getNavigationPaths(role);

  const navItems = navPaths.map((item) => ({ ...item }));

  const handleNavClick = (href: string) => {
    nav.pushPath(href);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Mobile Top Bar (slightly taller) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white shadow-md flex justify-between items-center px-4 py-5">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-orange-500 hover:text-orange-700"
        >
          {sidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
        {/* Text-only horizontal menu on mobile (compact) */}
        <nav className="flex-1 flex justify-center gap-4 text-xs font-medium text-gray-700">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className={`px-1 pb-0.5 border-b-2 ${
                  active ? 'border-orange-500 text-gray-900' : 'border-transparent text-gray-500'
                } whitespace-nowrap`}
              >
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Desktop top bar with slightly increased height */}
      <header className="bg-white shadow-md hidden md:block">
        <div className="flex items-center justify-center px-10 py-6">
          <nav className="flex items-center gap-8 text-sm font-medium text-gray-700">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={`pb-1.5 border-b-2 transition-colors ${
                    active
                      ? 'border-orange-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-16 md:pt-0 p-4 md:p-6 lg:p-8">{children}</main>
    </div>
  );
}
