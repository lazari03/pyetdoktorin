import { create } from 'zustand';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseconfig';
import { Appointment } from '../models/Appointment';
import { formatDate } from '../utils/dateUtils'; // Import formatDate utility

interface DashboardState {
  totalAppointments: number;
  nextAppointment: string | null;
  recentAppointments: Appointment[];
  fetchAppointments: (userId: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  totalAppointments: 0,
  nextAppointment: null,
  recentAppointments: [],
  fetchAppointments: async (userId) => {
    try {
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('patientId', '==', userId) // Adjust field name as per your database schema
      );
      const querySnapshot = await getDocs(appointmentsQuery);

      const appointments = querySnapshot.docs.map((doc) => doc.data() as Appointment);

      // Sort appointments by preferredDate in descending order and limit to 5
      const sortedAppointments = appointments
        .sort((a, b) => new Date(b.preferredDate).getTime() - new Date(a.preferredDate).getTime())
        .slice(0, 5);

      const upcomingAppointments = appointments
        .filter((appointment) => new Date(appointment.preferredDate) > new Date())
        .sort((a, b) => new Date(a.preferredDate).getTime() - new Date(b.preferredDate).getTime());

      set({
        totalAppointments: appointments.length,
        nextAppointment: upcomingAppointments.length
          ? `${formatDate(upcomingAppointments[0].preferredDate)} at ${upcomingAppointments[0].preferredTime}`
          : null,
        recentAppointments: sortedAppointments,
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  },
}));
