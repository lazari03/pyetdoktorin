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
        className={`hidden md:flex fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 z-30 ${sidebarOpen ? 'w-64' : 'w-16'} flex-col`}
      >
        <div className="p-4 flex items-center">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-orange-500 hover:text-orange-700 transition-colors flex items-center justify-center w-12 h-12">
            {sidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
        <ul className="relative flex-grow">
          {enhancedNavItems.map((item) => (
            <li key={item.name} className="relative mb-2">
              <Link
                href={item.href}
                className={`flex items-center w-full py-2 px-3 transition-all duration-300 rounded-lg ${pathname === item.href ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-orange-100 hover:text-orange-500'}`}
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
              } catch {
                console.error('Error signing out:');
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
        className={`md:hidden fixed top-0 left-0 h-full bg-white z-50 shadow-lg transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-64`}
      >
        <div className="p-4">
          <button onClick={() => setSidebarOpen(false)} className="text-gray-700 hover:text-orange-500">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <ul>
          {enhancedNavItems.map((item) => (
            <li key={item.name} className="mb-2 mt-4">
              <Link
                href={item.href}
                className={`flex items-center py-2 px-3 rounded-lg transition-colors duration-300 ${pathname === item.href ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-orange-100 hover:text-orange-500'}`}
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
              } catch {
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
    </>
  );
}
