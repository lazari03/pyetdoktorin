import { create } from 'zustand';

export enum AppointmentFilter {
  All = 'all',
  Unpaid = 'unpaid',
  Past = 'past',
}

interface DashboardState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  // UI-only state
  activeFilter: AppointmentFilter;
  showRedirecting: boolean;
  setActiveFilter: (filter: AppointmentFilter) => void;
  setShowRedirecting: (show: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  activeFilter: AppointmentFilter.All,
  showRedirecting: false,
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  setShowRedirecting: (show) => set({ showRedirecting: show }),
}));
