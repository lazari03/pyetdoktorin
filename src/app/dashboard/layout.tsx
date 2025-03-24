'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bars3Icon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { logout } from '../services/authService';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = () => {
      try {
        const storedRole = localStorage.getItem('userRole');
        if (storedRole) {
          setUserRole(storedRole);
        } else {
          setUserRole('patient');
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
        setUserRole('patient');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  const navItems = userRole === 'doctor'
    ? [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Upcoming Appointments', href: '/dashboard/appointments/upcoming' },
        { name: 'Appointment History', href: '/dashboard/appointments' },
        { name: 'My Profile', href: '/dashboard/myprofile' },
      ]
    : [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Search Doctors', href: '/dashboard/search' },
        { name: 'New Appointment', href: '/dashboard/new-appointment' },
        { name: 'Appointment History', href: '/dashboard/appointments' },
        { name: 'My Profile', href: '/dashboard/myprofile' },
      ];

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="loading loading-spinner loading-lg"></div>
      <span className="ml-2">Loading dashboard...</span>
    </div>;
  }

  return (
    <div className="min-h-screen bg-base-200">
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 left-0 h-full bg-base-100 shadow-xl transition-all duration-300 z-30 
          ${sidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`}
      >
        <div className="p-4 w-64">
          <nav className="mt-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block py-2.5 px-4 rounded-lg hover:bg-base-200 transition-colors"
                onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <button
              onClick={async () => {
                const success = await logout();
                if (success) {
                  window.location.href = '/login';
                }
              }}
              className="block w-full text-left py-2.5 px-4 rounded-lg hover:bg-base-200 transition-colors mt-8 text-error"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <header className="bg-base-100 shadow-md">
          <div className="flex items-center justify-between p-4 relative">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn btn-square btn-ghost z-10"
            >
              <Bars3Icon className="h-6 w-6" />
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
              <div className="avatar placeholder">
                <div className="bg-neutral text-neutral-content rounded-full w-8">
                  <span className="text-xs">{userRole?.charAt(0).toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="p-3 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
