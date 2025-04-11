import { create } from 'zustand';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseconfig';
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
      const field = role === UserRole.Doctor ? 'doctorId' : 'patientId'; // Dynamically determine the field
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where(field, '==', userId) // Use the dynamic field based on role
      );
      const querySnapshot = await getDocs(appointmentsQuery);

      const appointments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];

      // Sort appointments by preferredDate in descending order and limit to 5
      const sortedAppointments = appointments
        .filter((appointment) => appointment.preferredDate)
        .sort((a, b) => new Date(b.preferredDate!).getTime() - new Date(a.preferredDate!).getTime())
        .slice(0, 5);

      const upcomingAppointments = appointments
        .filter((appointment) => appointment.preferredDate && new Date(appointment.preferredDate) > new Date())
        .sort((a, b) => new Date(a.preferredDate!).getTime() - new Date(b.preferredDate!).getTime());

      set((state) => ({
        ...state,
        totalAppointments: appointments.length,
        nextAppointment: upcomingAppointments.length
          ? `${formatDate(upcomingAppointments[0].preferredDate!)} at ${upcomingAppointments[0].preferredTime || 'N/A'}`
          : null,
        recentAppointments: sortedAppointments,
      }));
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  },
  sidebarOpen: false,
  navPaths: [],
  toggleSidebar: () =>
    set((state) => ({ ...state, sidebarOpen: !state.sidebarOpen })),
  fetchNavigationPaths: (role) => {
    const paths = getNavigationPaths(role);
    set((state) => ({ ...state, navPaths: paths }));
  },
}));
