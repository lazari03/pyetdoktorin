import { create } from "zustand";
import { fetchAppointments } from "../services/appointmentsService"; // Import the service
import { Appointment } from "../models/Appointment"; // Import the model

interface AppointmentState {
  appointments: Appointment[];
  isDoctor: boolean | null;
  loading: boolean;
  error: string | null;
  setAppointments: (appointments: Appointment[]) => void;
  setIsDoctor: (isDoctor: boolean) => void;
  fetchAppointments: (userId: string, isDoctor: boolean) => Promise<void>;
  setAppointmentPaid: (appointmentId: string) => void; // Add this function
}

export const useAppointmentStore = create<AppointmentState>((set) => ({
  appointments: [],
  isDoctor: null,
  loading: false,
  error: null,
  setAppointments: (appointments) => set({ appointments }),
  setIsDoctor: (isDoctor) => set({ isDoctor }),
  fetchAppointments: async (userId: string, isDoctor: boolean) => {
    set({ loading: true, error: null });
    try {
      const fetchedAppointments = await fetchAppointments(userId, isDoctor);
      set({ appointments: fetchedAppointments, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch appointments", loading: false });
    }
  },
  setAppointmentPaid: (appointmentId) =>
    set((state) => ({
      appointments: state.appointments.map((appointment) =>
        appointment.id === appointmentId
          ? { ...appointment, isPaid: true }
          : appointment
      ),
    })),
}));

export const useInitializeAppointments = () => {
  const { fetchAppointments, setIsDoctor } = useAppointmentStore();
  return async (userId: string, isDoctor: boolean) => {
    setIsDoctor(isDoctor);
    await fetchAppointments(userId, isDoctor);
  };
};
