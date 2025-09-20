'use client';

import { useState } from 'react';
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
import { useEffect } from 'react';
import AddToHomeScreenPrompt from '../AddToHomeScreenPrompt';
// import IosInstallPrompt from '../../utils/IosInstallPrompt';
import { useInitializeAppointments } from '../../store/appointmentStore';
import { useAuth } from '@/context/AuthContext';
import { getNavigationPaths } from '@/store/navigationStore';
// import { signOut } from 'firebase/auth';
// import { getAuth } from 'firebase/auth';
import DashboardSidebar from '../components/DashboardSidebar';


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const { uid, role } = useAuth();
  useInitializeAppointments();

  // Service Worker Registration
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js');
    }
  }, []);

  if (!uid || !role) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  const navPaths = getNavigationPaths(role);

  const navItems = navPaths.map((item) => {
    let icon;
    switch (item.name) {
      case 'Dashboard':
        icon = <HomeIcon className="h-6 w-6" />;
        break;
      case 'Appointments':
      case 'Appointment History':
        icon = <ClipboardIcon className="h-6 w-6" />;
        break;
      case 'Profile':
        icon = <UserIcon className="h-6 w-6" />;
        break;
      case 'Calendar':
        icon = <CalendarIcon className="h-6 w-6" />;
        break;
      case 'New Appointment':
        icon = <PlusIcon className="h-6 w-6" />;
        break;
      default:
        icon = null;
    }
    return { ...item, icon };
  });

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

      {/* Add to Home Screen Prompt for mobile */}
      <AddToHomeScreenPrompt />
      {/* <IosInstallPrompt /> */}

      {/* Main Content Area */}
      <div className={`flex-grow transition-all duration-300 pt-16 md:pt-0 ${sidebarOpen && 'md:ml-64'} md:ml-16`}>
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
