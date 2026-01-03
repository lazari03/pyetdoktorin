'use client';

import { useState, useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import { usePathname } from 'next/navigation';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ClipboardIcon,
  UserIcon,
  CalendarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useInitializeAppointments } from '../../store/appointmentStore';
import { useDI } from '@/context/DIContext';
import { useAuth } from '@/context/AuthContext';
import { getNavigationPaths, NavigationKey } from '@/store/navigationStore';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import DashboardSidebar from '../components/DashboardSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  

  const { role, loading, isAuthenticated, user } = useAuth();
  // Use DI context for Clean Architecture
  const { fetchAppointmentsUseCase } = useDI();
  // Only call initializeAppointments when authenticated and role/user available
  const initializeAppointments = useInitializeAppointments((userId: string, isDoctor: boolean) => fetchAppointmentsUseCase.execute(userId, isDoctor));
  // Prevent infinite loop: only initialize once when role becomes available
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current && isAuthenticated && role && user && initializeAppointments) {
      const isDoctor = role === 'doctor';
      initializeAppointments(user.uid, isDoctor);
      initializedRef.current = true;
    }
  }, [isAuthenticated, role, user, initializeAppointments]);

  // Service Worker Registration
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js');
    }
  }, []);

  const nav = useNavigationCoordinator();
  // Redirect if not authenticated after loading completes (via coordinator)
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Pass the actual current path only; omit fallback so we don't always tag '/dashboard'
  nav.toLogin(pathname ?? undefined);
    }
  }, [loading, isAuthenticated, pathname, nav]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // If not authenticated return null (router will have navigated)
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated but role still loading show spinner
  if (!role) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  // Use admin-specific navigation when inside /admin, otherwise role-based defaults
  const isAdminSection = pathname?.startsWith('/admin');
  const navPaths = isAdminSection
    ? [
        { key: NavigationKey.Dashboard, name: 'dashboard', href: '/admin' },
        { key: NavigationKey.Appointments, name: 'users', href: '/admin/users' },
        { key: NavigationKey.AppointmentHistory, name: 'notifications', href: '/admin/notifications' },
        { key: NavigationKey.Profile, name: 'stats', href: '/admin/stats' },
      ]
    : getNavigationPaths(role);
  // Icon lookup for compact mapping instead of switch
  const iconMap: Record<NavigationKey, ReactElement> = {
    [NavigationKey.Dashboard]: <HomeIcon className="h-6 w-6" />,
    [NavigationKey.Appointments]: <ClipboardIcon className="h-6 w-6" />,
    [NavigationKey.AppointmentHistory]: <ClipboardIcon className="h-6 w-6" />,
    [NavigationKey.Profile]: <UserIcon className="h-6 w-6" />,
    [NavigationKey.Calendar]: <CalendarIcon className="h-6 w-6" />,
    [NavigationKey.NewAppointment]: <PlusIcon className="h-6 w-6" />,
  };

  const navItems = navPaths.map((item) => ({ ...item, icon: iconMap[item.key] }));

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        navItems={navItems}
        pathname={pathname || ''}
      />
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white shadow-md flex justify-center items-center px-4 py-4 relative">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-4 text-orange-500 hover:text-orange-700"
        >
          {sidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
        <Image
          src="/img/logo.png"
          alt="logo"
          width={120}
          height={60}
          className="w-auto h-auto"
          style={{ maxHeight: '2rem' }}
        />
      </div>
      {/* Main Content Area */}
      <div className={`flex-grow transition-all duration-300 pt-16 md:pt-0 ${sidebarOpen && 'md:ml-64'} md:ml-16`}>
        <header className="bg-white shadow-md hidden md:block">
          <div className="flex items-center justify-center p-6 relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 max-w-[50%]">
              <Image
                src="/img/logo.png"
                alt="logo"
                width={200}
                height={100}
                className="w-auto h-auto"
                style={{ maxHeight: '2.5rem' }}
              />
            </div>
            <div className="flex items-center gap-2" style={{ height: '3rem' }}>
              {/* Maintain height */}
            </div>
          </div>
        </header>
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
