'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon, HomeIcon, CalendarIcon, UserIcon, ClipboardIcon, StarIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext'; // Use the AuthContext

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname(); // Get the current path to determine the active link
  const { user, role, loading } = useAuth(); // Access user, role, and loading from AuthContext

  const handleLogout = () => {
    // Clear authentication token
    document.cookie = 'auth-token=; path=/; max-age=0';
  
    // Get the redirect URL from query parameters (if any)
    const redirectUrl = new URLSearchParams(window.location.search).get('redirect');
  
    // Define a whitelist of allowed URLs
    const allowedRedirects = ['/login', '/dashboard'];
  
    // Validate the redirect URL
    const isValidRedirect = redirectUrl && allowedRedirects.includes(redirectUrl);
  
    // Redirect to the validated URL or fallback to '/login'
    window.location.href = isValidRedirect ? redirectUrl : '/login';
  };

  const navItems = role === 'doctor'
    ? [
        { name: 'Dashboard', href: '/dashboard', icon: <HomeIcon className="h-6 w-6" /> },
        { name: 'Upcoming Appointments', href: '/dashboard/appointments/upcoming', icon: <ClipboardIcon className="h-6 w-6" /> },
        { name: 'Appointment History', href: '/dashboard/appointments', icon: <ClipboardIcon className="h-6 w-6" /> },
        { name: 'My Profile', href: '/dashboard/myprofile', icon: <UserIcon className="h-6 w-6" /> },
        { name: 'Calendar', href: '/dashboard/doctor/calendar', icon: <CalendarIcon className="h-6 w-6" /> },
      ]
    : [
        { name: 'Dashboard', href: '/dashboard', icon: <HomeIcon className="h-6 w-6" /> },
        { name: 'Search Doctors', href: '/dashboard/search', icon: <StarIcon className="h-6 w-6" /> },
        { name: 'New Appointment', href: '/dashboard/new-appointment', icon: <ClipboardIcon className="h-6 w-6" /> },
        { name: 'Appointment History', href: '/dashboard/appointments', icon: <ClipboardIcon className="h-6 w-6" /> },
        { name: 'My Profile', href: '/dashboard/myprofile', icon: <UserIcon className="h-6 w-6" /> },
      ];

  if (loading) {
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
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 z-30 ${
          sidebarOpen ? 'w-64' : 'w-16'
        } flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-700 hover:text-orange-500 transition-colors flex items-center justify-center w-12 h-12"
          >
            {sidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>

        {/* Sidebar Items */}
        <ul className="relative flex-grow">
          {navItems.map((item) => (
            <li key={item.name} className="relative">
              <Link
                href={item.href}
                className={`flex items-center w-full py-2 px-3 transition-all duration-300 rounded-lg ${
                  pathname === item.href
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 hover:bg-orange-100 hover:text-orange-500'
                }`}
              >
                {/* Icon */}
                <span className="flex items-center justify-center w-10 h-10">{item.icon}</span>

                {/* Text */}
                <span
                  className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                    sidebarOpen ? 'opacity-100 ml-3 max-w-full' : 'opacity-0 max-w-0'
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Logout Button */}
        <div className={`p-4 flex ${sidebarOpen ? 'items-start' : 'items-center'} w-full`}>
          <button
            onClick={handleLogout}
            className={`flex ${sidebarOpen ? 'flex-row gap-4' : 'flex-col'} items-center w-full text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors duration-200`}
          >
            <span className="flex items-center justify-center w-12 h-12 rounded-lg bg-red-100 text-red-500">
              <UserIcon className="h-6 w-6" />
            </span>
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                sidebarOpen ? 'opacity-100 max-w-full ml-4' : 'opacity-0 max-w-0'
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
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
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium hidden md:inline-block">
                Hi {user?.displayName || 'User'} {/* Display the user's name */}
              </span>
            </div>
          </div>
        </header>
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}