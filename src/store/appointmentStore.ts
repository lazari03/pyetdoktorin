import { create } from "zustand";
import { Appointment } from "@/domain/entities/Appointment";
import { getAppointmentAction } from "@/presentation/utils/appointmentActionButton";
import { APPOINTMENT_DURATION_MINUTES } from '../config/appointmentConfig';
import { UserRole } from '@/domain/entities/UserRole';
import { listAppointments } from '@/network/appointments';

/**
 * Convert a time string (either "HH:mm" or "hh:mm AM/PM") into "HH:mm" 24-hour format
 * so it can be used in `new Date("YYYY-MM-DDThh:mm")`.
 */
function normalizeTo24h(time: string): string {
  const ampmMatch = time.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2];
    const period = ampmMatch[3].toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }
  return time; // already in HH:mm
}

interface AppointmentState {
  appointments: Appointment[];
  isDoctor: boolean | null;
  loading: boolean;
  error: string | null;
  setAppointments: (appointments: Appointment[]) => void;
  optimisticMarkPaid: (appointmentId: string) => void;
  optimisticPaidIds: Record<string, true>;
  setIsDoctor: (isDoctor: boolean | null) => void;
  fetchAppointments: (role?: UserRole | null) => Promise<void>;
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
  optimisticMarkPaid: (appointmentId) =>
    set((state) => ({
      appointments: state.appointments.map((appointment) =>
        appointment.id === appointmentId
          ? { ...appointment, paymentStatus: "processing" as const }
          : appointment
      ),
      optimisticPaidIds: { ...state.optimisticPaidIds, [appointmentId]: true },
    })),
  optimisticPaidIds: {},
  setIsDoctor: (isDoctor) => set({ isDoctor }),
  fetchAppointments: async (role) => {
    set({ loading: true, error: null });
    try {
      const response = await listAppointments();
      set((state) => {
        const optimisticPaidIds = { ...state.optimisticPaidIds };
      const items = response.items.map((appointment) => {
        if (optimisticPaidIds[appointment.id]) {
          if (appointment.isPaid) {
            delete optimisticPaidIds[appointment.id];
            return appointment;
          }
          return { ...appointment, paymentStatus: "processing" as const };
        }
        return appointment;
      });
        return {
          appointments: items,
          optimisticPaidIds,
          loading: false,
          isDoctor: typeof role === 'undefined' ? get().isDoctor : role === UserRole.Doctor,
        };
      });
    } catch {
      set({ error: "Failed to fetch appointments", loading: false });
    }
  },
  setAppointmentPaid: async (appointmentId, setAppointmentPaidUseCase) => setAppointmentPaidUseCase(appointmentId),
  handlePayNow: async (appointmentId, amount, handlePayNowUseCase) => handlePayNowUseCase(appointmentId, amount),
  checkIfPastAppointment: async (appointmentId, checkIfPastAppointmentUseCase) => checkIfPastAppointmentUseCase(appointmentId),
  isPastAppointment: (date, time) => {
    const appointmentDateTime = new Date(`${date}T${normalizeTo24h(time)}`);
    const appointmentEndTime = new Date(appointmentDateTime.getTime() + 30 * 60000);
    return appointmentEndTime < new Date();
  },
  isAppointmentPast: (appointment) => {
    const appointmentDateTime = new Date(`${appointment.preferredDate}T${normalizeTo24h(appointment.preferredTime)}`);
    const appointmentEndTime = new Date(appointmentDateTime.getTime() + APPOINTMENT_DURATION_MINUTES * 60000);
    return appointmentEndTime < new Date();
  },
  getAppointmentAction: (appointment) => getAppointmentAction(appointment, get().isAppointmentPast),
}));

export const useInitializeAppointments = () => {
  const { fetchAppointments, setIsDoctor } = useAppointmentStore();
  return async (role?: UserRole | null) => {
    if (typeof role !== 'undefined') {
      setIsDoctor(role === UserRole.Doctor);
    }
    await fetchAppointments(role);
  };
};
