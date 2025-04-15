'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bars3Icon,
  XMarkIcon,
  PowerIcon,
  HomeIcon,
  ClipboardIcon,
  UserIcon,
  CalendarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useAppointmentStore, useInitializeAppointments } from '../../store/appointmentStore';
import { useAuth } from '@/context/AuthContext';
import { getNavigationPaths } from '@/store/navigationStore';
import { signOut } from 'firebase/auth';
import { getAuth } from 'firebase/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const { uid, role } = useAuth();
  useInitializeAppointments();
  const { appointments, loading: appointmentsLoading } = useAppointmentStore();

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
    <div className="min-h-screen flex bg-gray-50">
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 z-30 ${
          sidebarOpen ? 'w-64' : 'w-16'
        } flex flex-col`}
      >
        <div className="p-4 flex items-center">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-700 hover:text-orange-500 transition-colors flex items-center justify-center w-12 h-12">
            {sidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
        <ul className="relative flex-grow">
          {navItems.map((item) => (
            <li key={item.name} className="relative mb-2">
              <Link
                href={item.href}
                className={`flex items-center w-full py-2 px-3 transition-all duration-300 rounded-lg ${pathname === item.href ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-orange-100 hover:text-orange-500'
                  }`}
              >
                <span className="flex items-center justify-center w-10 h-10">{item.icon}</span>
                <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${sidebarOpen ? 'opacity-100 ml-3 max-w-full' : 'opacity-0 max-w-0'}`}>
                  {item.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className={`p-4 flex ${sidebarOpen ? 'items-start' : 'items-center'} w-full`}>
          <button
            onClick={async () => {
              const auth = getAuth(); // Get the Firebase authentication instance

              try {
                // Sign out from Firebase
                await signOut(auth);
                console.log('User signed out successfully');

                // Clear the auth token cookie
                document.cookie = 'auth-token=; path=/; max-age=0'; // Clear cookie
                console.log('Auth token cookie cleared');

                // Redirect to login page
                window.location.href = '/login';
              } catch (error) {
                console.error('Error signing out:', error);
                alert('Error signing out. Please try again.');
              }
            }}
            className={`flex items-center w-full py-2 px-3 transition-all duration-300 rounded-lg ${sidebarOpen ? 'text-red-500 hover:bg-red-100 hover:text-red-700' : 'flex-col text-red-500'
              }`}
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-700">
              <PowerIcon className="h-6 w-6" />
            </span>
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${sidebarOpen ? 'opacity-100 ml-3 max-w-full' : 'opacity-0 max-w-0'
                }`}
            >
              Logout
            </span>
          </button>
        </div>
      </div>
      <div className={`flex-grow transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <header className="bg-white shadow-md">
          <div className="flex items-center justify-between p-6 relative">
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
            <div className="flex items-center gap-2" style={{ height: '2.5rem' }}>
              {/* Preserve header height */}
            </div>
          </div>
        </header>
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}