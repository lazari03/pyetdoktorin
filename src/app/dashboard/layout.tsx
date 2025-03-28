'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname(); // Get the current path to determine the active link
  const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 60 minutes in milliseconds
  let inactivityTimer: NodeJS.Timeout;

  useEffect(() => {
    const fetchUserRole = () => {
      try {
        const storedRole = localStorage.getItem('userRole');
        if (storedRole) {
          setUserRole(storedRole); // Only set userRole if it exists
        } else {
          console.warn('No user role found in localStorage.');
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();

    // Set up inactivity timer
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        handleLogout();
      }, INACTIVITY_TIMEOUT);
    };

    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);
    resetInactivityTimer(); // Start the timer initially

    return () => {
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
      clearTimeout(inactivityTimer);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    document.cookie = 'auth-token=; path=/; max-age=0';
    window.location.href = '/login';
  };

  const navItems = userRole === 'doctor'
    ? [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Upcoming Appointments', href: '/dashboard/appointments/upcoming' },
      { name: 'Appointment History', href: '/dashboard/appointments' },
      { name: 'My Profile', href: '/dashboard/myprofile' },
      { name: 'Calendar', href: '/dashboard/doctor/calendar' },
    ]
    : [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Search Doctors', href: '/dashboard/search' },
      { name: 'New Appointment', href: '/dashboard/new-appointment' },
      { name: 'Appointment History', href: '/dashboard/appointments' },
      { name: 'My Profile', href: '/dashboard/myprofile' },
    ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-md transition-all duration-300 z-30 ${sidebarOpen ? 'w-64' : 'w-0'
          } overflow-hidden`}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-700">Menu</span>
            <button
              onClick={() => setSidebarOpen(false)}

            >
              <XMarkIcon className="h-6 w-6 text-gray-700" />
            </button>
          </div>
          <ul className="menu bg-base-100 w-full rounded-box">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`px-4 py-2 rounded ${pathname === item.href
                      ? 'bg-orange-400 text-white' // Selected item: white text
                      : 'text-black hover:bg-orange-400' // Unselected: black text, hover bg only
                    }`}
                  style={{ textDecoration: 'none' }} // Force remove underline
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:bg-gray-100 px-4 py-2 rounded"
              >
                Logout
              </button>
            </li>
          </ul>

        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-grow transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <header className="bg-white shadow-md">
          <div className="flex items-center justify-between p-4 relative">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn btn-square btn-ghost"
            >
              <Bars3Icon className="h-6 w-6 text-white-700" />
            </button>
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
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium hidden md:inline-block">
                {userRole === 'doctor' ? 'Doctor Account' : 'Patient Account'}
              </span>
            </div>
          </div>
        </header>
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
