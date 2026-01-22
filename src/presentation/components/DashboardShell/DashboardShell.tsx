"use client";

import { useState, useEffect, useRef, type ReactElement } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon as HomeOutline,
  ClipboardIcon as ClipboardOutline,
  CalendarIcon as CalendarOutline,
  PlusIcon as PlusOutline,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolid,
  UsersIcon as UsersSolid,
  BellIcon as BellSolid,
  ChartBarIcon as ChartBarSolid,
} from '@heroicons/react/24/solid';
import DashboardSidebar from '../../app/components/DashboardSidebar';
import { useAuth } from '@/context/AuthContext';
import { useDI } from '@/context/DIContext';
import { useInitializeAppointments } from '@/store/appointmentStore';
import { getNavigationPaths, NavigationKey } from '@/store/navigationStore';

type NavItem = { key: NavigationKey; name: string; href: string };

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const { role, loading, isAuthenticated, user } = useAuth();
  const { fetchAppointmentsUseCase } = useDI();
  const initializeAppointments = useInitializeAppointments((userId: string, isDoctor: boolean) => fetchAppointmentsUseCase.execute(userId, isDoctor));
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current && isAuthenticated && role && user && initializeAppointments) {
      const isDoctor = role === 'doctor';
      initializeAppointments(user.uid, isDoctor);
      initializedRef.current = true;
    }
  }, [isAuthenticated, role, user, initializeAppointments]);

  // ...existing code (rest of the component)
}
