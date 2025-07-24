import { create } from 'zustand';
import { fetchAppointments } from '../services/appointmentsService';
import { Appointment } from '../models/Appointment';
import { formatDate } from '../utils/dateUtils';
import { UserRole } from '../models/UserRole';
import { getNavigationPaths } from './navigationStore';
import { JSX } from 'react';

interface DashboardState {
  totalAppointments: number;
  nextAppointment: string | null;
  recentAppointments: Appointment[];
  fetchAppointments: (userId: string, role: UserRole) => Promise<void>;
  sidebarOpen: boolean;
  navPaths: { name: string; href: string; icon?: JSX.Element }[];
  toggleSidebar: () => void;
  fetchNavigationPaths: (role: UserRole) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  totalAppointments: 0,
  nextAppointment: null,
  recentAppointments: [],
  fetchAppointments: async (userId, role) => {
    try {
      const isDoctor = role === UserRole.Doctor;

      const mappedAppointments = await fetchAppointments(userId, isDoctor);

      // Filter and sort upcoming appointments
      const upcomingAppointments = mappedAppointments
        .filter((appointment) => {
          const isUpcoming = appointment.preferredDate && new Date(appointment.preferredDate) > new Date();
          const isAccepted = role === UserRole.Doctor ? appointment.status === 'accepted' : true;
          return isUpcoming && isAccepted;
        })
        .sort((a, b) => new Date(a.preferredDate!).getTime() - new Date(b.preferredDate!).getTime());

      // Sort appointments by preferredDate in descending order for recent appointments
      const sortedAppointments = mappedAppointments
        .filter((appointment) => appointment.preferredDate)
        .sort((a, b) => new Date(b.preferredDate!).getTime() - new Date(a.preferredDate!).getTime())
        .slice(0, 5);

      set((state) => ({
        ...state,
        totalAppointments: mappedAppointments.length,
        nextAppointment: upcomingAppointments.length
          ? `${formatDate(upcomingAppointments[0].preferredDate!)} at ${upcomingAppointments[0].preferredTime || 'N/A'}`
          : null,
        recentAppointments: sortedAppointments,
      }));
    } catch (error) {
      console.error('Failed to fetch dashboard appointments:', error);
    }
  },
  sidebarOpen: false,
  navPaths: [],
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  fetchNavigationPaths: (role) => set({ navPaths: getNavigationPaths(role) }),
}));
