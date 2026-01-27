import { useTranslation } from 'react-i18next';
import '@i18n';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDI } from '@/context/DIContext';

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
  const { subscribePendingAppointmentsUseCase } = useDI();

  useEffect(() => {
    if (!user?.uid || role !== 'doctor') return;
    const unsubscribe = subscribePendingAppointmentsUseCase.execute(user.uid, (count) => {
      setHasNewNotifications(count > 0);
    });
    return () => unsubscribe();
  }, [user, role, subscribePendingAppointmentsUseCase]);

}
