import { create } from 'zustand';
import { fetchAppointments } from '../app/services/appointmentService'; // Import the service
import { useEffect } from 'react';

interface Appointment {
  id: string;
  createdAt: string;
  appointmentType: string;
  notes: string;
  status: string;
  preferredDate?: string;
  preferredTime?: string;
  doctorName?: string;
  patientName?: string;
}

interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  fetchAppointments: (status: string) => Promise<void>;
}

export const useAppointmentStore = create<AppointmentState>((set) => ({
  appointments: [],
  loading: false,
  error: null,
  fetchAppointments: async (status: string) => {
    set({ loading: true, error: null });
    try {
      const appointments = await fetchAppointments(status); // Use the service to fetch data
      set({ appointments, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch appointments', loading: false });
    }
  },
}));

export const useInitializeAppointments = (userId: string) => {
  const fetchAppointments = useAppointmentStore((state) => state.fetchAppointments);

  useEffect(() => {
    if (userId) {
      fetchAppointments("all"); // Fetch all appointments for the user
    }
  }, [userId, fetchAppointments]);
};
