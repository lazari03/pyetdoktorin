import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import '@i18n';
import { useSessionStore } from '@/store/sessionStore';
import { Bars3Icon, XMarkIcon, PowerIcon, BellIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { db } from '../../../config/firebaseconfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';

interface DashboardSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  navItems: { name: string; href: string; icon: React.ReactNode }[];
  pathname: string;
}

export default function DashboardSidebar({ sidebarOpen, setSidebarOpen, navItems, pathname }: DashboardSidebarProps) {
  const { t } = useTranslation();
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

  // ...existing code (rest of the component)
}
