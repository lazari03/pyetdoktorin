import { create } from 'zustand';
import { UserRole } from '@/domain/entities/UserRole';
import { getNavigationPaths, NavigationItem } from './navigationStore';
import { JSX } from 'react';

export enum AppointmentFilter {
  All = 'all',
  Unpaid = 'unpaid',
  Past = 'past',
}

interface DashboardState {
  sidebarOpen: boolean;
  navPaths: (NavigationItem & { icon?: JSX.Element })[];
  toggleSidebar: () => void;
  fetchNavigationPaths: (role: UserRole) => void;
  // UI-only state
  activeFilter: AppointmentFilter;
  showRedirecting: boolean;
  setActiveFilter: (filter: AppointmentFilter) => void;
  setShowRedirecting: (show: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  sidebarOpen: false,
  navPaths: [],
  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  fetchNavigationPaths: (role) =>
    set({ navPaths: getNavigationPaths(role) }),
  activeFilter: AppointmentFilter.All,
  showRedirecting: false,
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  setShowRedirecting: (show) => set({ showRedirecting: show }),
}));
