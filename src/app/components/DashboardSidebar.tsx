import Link from 'next/link';
import { getAuth, signOut } from 'firebase/auth';
import { Bars3Icon, XMarkIcon, PowerIcon, BellIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { db } from '../../config/firebaseconfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

interface DashboardSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  navItems: { name: string; href: string; icon: React.ReactNode }[];
  pathname: string;
}

export default function DashboardSidebar({ sidebarOpen, setSidebarOpen, navItems, pathname }: DashboardSidebarProps) {
  // Notification state
  const { user, role } = useAuth();
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  useEffect(() => {
    if (!user?.uid || role !== 'doctor') return;
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', user.uid),
      where('status', '==', 'pending')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHasNewNotifications(!snapshot.empty);
    });
    return () => unsubscribe();
  }, [user, role]);

  // Add Notifications menu item
  const enhancedNavItems = [
    ...navItems,
    {
      name: 'Notifications',
      href: '/dashboard/notifications',
      icon: (
        <span className="relative">
          <BellIcon className="h-6 w-6" />
          {hasNewNotifications && (
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
          )}
        </span>
      ),
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div
  className={`hidden md:flex fixed top-0 left-0 h-full bg-primary shadow-lg transition-all duration-300 z-30 ${sidebarOpen ? 'w-64' : 'w-16'} flex-col`}
      >
        <div className="p-4 flex items-center">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-turquoise hover:text-turquoise transition-colors flex items-center justify-center w-12 h-12">
            {sidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
        <ul className="relative flex-grow">
          {enhancedNavItems.map((item) => (
            <li key={item.name} className="relative mb-2">
              <Link
                href={item.href}
                  className={`flex items-center w-full py-2 px-3 transition-all duration-300 rounded-lg ${pathname === item.href ? 'bg-white text-primary' : 'text-gray-700 hover:bg-primary hover:text-primary'}`}
              >
                <span className={`flex items-center justify-center w-10 h-10 ${pathname === item.href ? 'text-primary' : 'text-white'}`}>{item.icon}</span>
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
              } catch {
                alert('Error signing out. Please try again.');
              }
            }}
            className={`flex items-center w-full py-2 px-3 transition-all duration-300 rounded-lg ${sidebarOpen ? 'text-red-500 hover:bg-red-100 hover:text-red-700' : 'flex-col text-red-500'}`}
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
      {/* Mobile Slide-in Menu */}
      <div
  className={`md:hidden fixed top-0 left-0 h-full bg-primary z-50 shadow-lg transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-20 flex flex-col items-center py-6 space-y-8`}
      >
  <button onClick={() => setSidebarOpen(false)} className="text-gray-700 hover:text-turquoise mb-8">
          <XMarkIcon className="h-6 w-6" />
        </button>
        <ul className="flex flex-col items-center w-full">
          {enhancedNavItems.map((item) => (
            <li key={item.name} className="mb-8">
              <Link
                href={item.href}
                className={`bg-white rounded-full p-2 shadow-md hover:scale-105 transition-transform flex items-center justify-center ${pathname === item.href ? 'ring-2 ring-turquoise' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="flex items-center justify-center w-10 h-10">{item.icon}</span>
              </Link>
            </li>
          ))}
        </ul>
        <button
          onClick={async () => {
            const auth = getAuth();
            try {
              await signOut(auth);
              document.cookie = 'auth-token=; path=/; max-age=0';
              window.location.href = '/login';
            } catch {
              alert('Error signing out.');
            }
          }}
          className="bg-white rounded-full p-2 shadow-md hover:scale-105 transition-transform flex items-center justify-center text-red-500"
        >
          <PowerIcon className="h-6 w-6" />
        </button>
      </div>
    </>
  );
}
