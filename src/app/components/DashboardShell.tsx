"use client";

import { useState, useEffect, useRef, type ReactElement } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon as HomeOutline,
  ClipboardIcon as ClipboardOutline,
  CalendarIcon as CalendarOutline,
  PlusIcon as PlusOutline,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolid,
  UsersIcon as UsersSolid,
  BellIcon as BellSolid,
  ChartBarIcon as ChartBarSolid,
} from '@heroicons/react/24/solid';
import DashboardSidebar from './DashboardSidebar';
import { useAuth } from '@/context/AuthContext';
import { useDI } from '@/context/DIContext';
import { useInitializeAppointments } from '@/store/appointmentStore';
import { getNavigationPaths, NavigationKey } from '@/store/navigationStore';

type NavItem = { key: NavigationKey; name: string; href: string };

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const { role, loading, isAuthenticated, user } = useAuth();
  const { fetchAppointmentsUseCase } = useDI();
  const initializeAppointments = useInitializeAppointments((userId: string, isDoctor: boolean) => fetchAppointmentsUseCase.execute(userId, isDoctor));
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current && isAuthenticated && role && user && initializeAppointments) {
      const isDoctor = role === 'doctor';
      initializeAppointments(user.uid, isDoctor);
      initializedRef.current = true;
    }
  }, [isAuthenticated, role, user, initializeAppointments]);

  // Mobile SW registration, safe on client
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(() => {});
    }
  }, []);

  // Loading guard (keeps parity with dashboard experience)
  if (loading || !isAuthenticated || !role) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-50">
        <div className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  // Compute role-based or custom admin nav
  const isAdminSection = pathname?.startsWith('/admin');
  const navPaths: NavItem[] = isAdminSection
    ? [
        { key: NavigationKey.Dashboard, name: 'dashboard', href: '/admin' },
        { key: NavigationKey.Appointments, name: 'users', href: '/admin/users' },
        { key: NavigationKey.AppointmentHistory, name: 'notifications', href: '/admin/notifications' },
        // Profile nav removed for admin
      ]
    : getNavigationPaths(role);

  const iconMap: Partial<Record<NavigationKey, ReactElement>> = isAdminSection
    ? {
        [NavigationKey.Dashboard]: <HomeSolid className="h-6 w-6" />,
        [NavigationKey.Appointments]: <UsersSolid className="h-6 w-6" />,
        [NavigationKey.AppointmentHistory]: <BellSolid className="h-6 w-6" />,
        // Profile nav removed for admin
        [NavigationKey.Calendar]: <ChartBarSolid className="h-6 w-6" />,
        [NavigationKey.NewAppointment]: <ChartBarSolid className="h-6 w-6" />,
      }
    : {
        [NavigationKey.Dashboard]: <HomeOutline className="h-6 w-6" />,
        [NavigationKey.Appointments]: <ClipboardOutline className="h-6 w-6" />,
        [NavigationKey.AppointmentHistory]: <ClipboardOutline className="h-6 w-6" />,
        // Profile nav removed for non-admin
        [NavigationKey.Calendar]: <CalendarOutline className="h-6 w-6" />,
        [NavigationKey.NewAppointment]: <PlusOutline className="h-6 w-6" />,
      };
  const navItems = navPaths.map((item) => ({ ...item, icon: iconMap[item.key] }));

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-neutral-50 font-sans">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        navItems={navItems}
        pathname={pathname || ''}
      />
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/90 shadow-sm flex justify-center items-center px-6 py-4 rounded-b-2xl border-b border-neutral-200">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-4 text-teal-600 hover:text-teal-800 transition-colors"
        >
          {sidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
        <Image
          src="/img/logo.png"
          alt="logo"
          width={120}
          height={60}
          className="w-auto h-auto max-h-8"
        />
      </div>
      {/* Main Content Area */}
      <div className={`flex-grow transition-all duration-300 pt-20 md:pt-0 ${sidebarOpen && 'md:ml-64'} md:ml-20`}> 
        <header className="bg-white/90 shadow-sm hidden md:block rounded-b-2xl border-b border-neutral-200">
          <div className="flex items-center justify-center py-8 px-8 relative">
            <div className="absolute left-1/2 -translate-x-1/2 max-w-[50%]">
              <Image
                src="/img/logo.png"
                alt="logo"
                width={200}
                height={100}
                className="w-auto h-auto max-h-10"
              />
            </div>
            <div className="flex items-center gap-2 h-12" />
          </div>
        </header>
        <main className="p-6 md:p-10 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10 min-h-[60vh] text-gray-800">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
