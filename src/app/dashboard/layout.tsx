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
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 z-30 ${sidebarOpen ? 'w-64' : 'w-16'
          } flex-col`}
      >
        <div className="p-4 flex items-center">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-orange-500 hover:text-orange-700 transition-colors flex items-center justify-center w-12 h-12">
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
              const auth = getAuth();
              try {
                await signOut(auth);
                document.cookie = 'auth-token=; path=/; max-age=0';
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
            <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${sidebarOpen ? 'opacity-100 ml-3 max-w-full' : 'opacity-0 max-w-0'}`}>
              Logout
            </span>
          </button>
        </div>
      </div>

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

      {/* Mobile Slide-in Menu */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full bg-white z-50 shadow-lg transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } w-64`}
      >
        <div className="p-4">
          <button onClick={() => setSidebarOpen(false)} className="text-gray-700 hover:text-orange-500">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-2 mt-4">
              <Link
                href={item.href}
                className={`flex items-center py-2 px-3 rounded-lg transition-colors duration-300 ${pathname === item.href ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-orange-100 hover:text-orange-500'
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
        <div className="p-4">
          <button
            onClick={async () => {
              const auth = getAuth();
              try {
                await signOut(auth);
                document.cookie = 'auth-token=; path=/; max-age=0';
                window.location.href = '/login';
              } catch (error) {
                alert('Error signing out.');
              }
            }}
            className="flex items-center py-2 px-3 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg"
          >
            <PowerIcon className="h-6 w-6 mr-2" />
            Logout
          </button>
        </div>
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
