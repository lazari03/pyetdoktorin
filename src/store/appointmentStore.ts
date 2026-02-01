import { create } from "zustand";
import { Appointment } from "@/domain/entities/Appointment";
import { getAppointmentAction } from "@/presentation/utils/appointmentActionButton";
import { APPOINTMENT_DURATION_MINUTES } from '../config/appointmentConfig';
import { isDoctor } from "@/domain/rules/userRules";

interface AppointmentState {
  appointments: Appointment[];
  isDoctor: boolean | null;
  loading: boolean;
  error: string | null;
  setAppointments: (appointments: Appointment[]) => void;
  setIsDoctor: (isDoctor: boolean | null) => void;
  fetchUserRole: (userId: string, getUserRoleUseCase: (userId: string) => Promise<string>) => Promise<void>;
  fetchAppointments: (userId: string, isDoctor: boolean, fetchAppointmentsUseCase: (userId: string, isDoctor: boolean) => Promise<Appointment[]>) => Promise<void>;
  setAppointmentPaid: (appointmentId: string, setAppointmentPaidUseCase: (appointmentId: string) => Promise<void>) => Promise<void>;
  handlePayNow: (appointmentId: string, amount: number, handlePayNowUseCase: (appointmentId: string, amount: number) => Promise<void>) => Promise<void>;
  checkIfPastAppointment: (appointmentId: string, checkIfPastAppointmentUseCase: (appointmentId: string) => Promise<boolean>) => Promise<boolean>;
  isPastAppointment: (date: string, time: string) => boolean;
  isAppointmentPast: (appointment: Appointment) => boolean;
  getAppointmentAction: (appointment: Appointment) => { label: string; disabled: boolean; variant: string };
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  isDoctor: null,
  loading: false,
  error: null,
  setAppointments: (appointments) => set({ appointments }),
  setIsDoctor: (isDoctor) => set({ isDoctor }),
  fetchUserRole: async (userId: string, getUserRoleUseCase) => {
    set({ loading: true, error: null });
    try {
      const role = await getUserRoleUseCase(userId);
      set({ isDoctor: isDoctor(role as import("@/domain/entities/UserRole").UserRole), loading: false });
    } catch {
      set({ error: "Failed to fetch user role", loading: false });
    }
  },
  fetchAppointments: async (userId: string, isDoctor: boolean, fetchAppointmentsUseCase) => {
    set({ loading: true, error: null });
    try {
      const fetchedAppointments: Appointment[] = await fetchAppointmentsUseCase(userId, isDoctor);
      set({ appointments: fetchedAppointments, loading: false });
    } catch {
      set({ error: "Failed to fetch appointments", loading: false });
    }
  },
  setAppointmentPaid: async (appointmentId, setAppointmentPaidUseCase) => setAppointmentPaidUseCase(appointmentId),
  handlePayNow: async (appointmentId, amount, handlePayNowUseCase) => handlePayNowUseCase(appointmentId, amount),
  checkIfPastAppointment: async (appointmentId, checkIfPastAppointmentUseCase) => checkIfPastAppointmentUseCase(appointmentId),
  isPastAppointment: (date, time) => {
    const appointmentDateTime = new Date(`${date}T${time}`);
    const appointmentEndTime = new Date(appointmentDateTime.getTime() + 30 * 60000);
    return appointmentEndTime < new Date();
  },
  isAppointmentPast: (appointment) => {
    const appointmentDateTime = new Date(`${appointment.preferredDate}T${appointment.preferredTime}`);
    const appointmentEndTime = new Date(appointmentDateTime.getTime() + APPOINTMENT_DURATION_MINUTES * 60000);
    return appointmentEndTime < new Date();
  },
  getAppointmentAction: (appointment) => getAppointmentAction(appointment, get().isAppointmentPast),
}));

export const useInitializeAppointments = (fetchAppointmentsUseCase: (userId: string, isDoctor: boolean) => Promise<Appointment[]>) => {
  const { fetchAppointments, setIsDoctor } = useAppointmentStore();
  return async (userId: string, isDoctor: boolean) => {
    setIsDoctor(isDoctor);
    await fetchAppointments(userId, isDoctor, fetchAppointmentsUseCase);
  };
};
