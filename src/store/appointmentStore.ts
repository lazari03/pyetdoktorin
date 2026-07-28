import { create } from "zustand";
import { Appointment } from "@/domain/entities/Appointment";
import { getAppointmentAction, isPastAppointment, isAppointmentPast } from "@/domain/rules/appointmentRules";
import { APPOINTMENT_DURATION_MINUTES } from '@/config/appointmentConfig';
import { UserRole } from '@/domain/entities/UserRole';
import { APPOINTMENT_ERROR_CODES } from '@/config/errorCodes';
import { BackendError } from '@/application/errors/BackendError';
import { AppointmentService } from '@/infrastructure/services/appointmentService';

const appointmentService = new AppointmentService();

function resolveAppointmentFetchError(error: unknown): string {
  if (error instanceof BackendError) {
    if (error.status === 401) return APPOINTMENT_ERROR_CODES.Unauthorized;
    if (error.status === 403) return APPOINTMENT_ERROR_CODES.Forbidden;
  }
  return APPOINTMENT_ERROR_CODES.FetchFailed;
}

interface AppointmentState {
  appointments: Appointment[];
  isDoctor: boolean | null;
  loading: boolean;
  error: string | null;
  lastFetchedAt: number;
  setAppointments: (appointments: Appointment[]) => void;
  setIsDoctor: (isDoctor: boolean | null) => void;
  fetchAppointments: (role?: UserRole | null, forceRefresh?: boolean) => Promise<void>;
  subscribeAppointments: (userId: string, role: UserRole) => () => void;
  setAppointmentPaid: (appointmentId: string, setAppointmentPaidUseCase: (appointmentId: string) => Promise<void>) => Promise<void>;
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
  lastFetchedAt: 0,
  setAppointments: (appointments) => set({ appointments }),
  setIsDoctor: (isDoctor) => set({ isDoctor }),
  fetchAppointments: async (role, forceRefresh = false) => {
    const state = get();
    // Skip the network call if we already have fresh data (< 10 s old)
    // and no explicit refresh was requested. Prevents redundant fetches
    // when multiple components mount and call fetchAppointments in parallel.
    if (
      !forceRefresh &&
      state.appointments.length > 0 &&
      Date.now() - state.lastFetchedAt < 10_000
    ) {
      return;
    }
    set({ loading: true, error: null });
    try {
      const response = { items: await appointmentService.listAppointments() };
      set({
        appointments: response.items,
        loading: false,
        lastFetchedAt: Date.now(),
        isDoctor: typeof role === 'undefined' ? get().isDoctor : role === UserRole.Doctor,
      });
    } catch (error) {
      set({ error: resolveAppointmentFetchError(error), loading: false });
    }
  },
  subscribeAppointments: (_userId, role) => {
    set({ loading: true, error: null, isDoctor: role === UserRole.Doctor });
    let disposed = false;

    const refreshFromBackend = async () => {
      try {
        const response = { items: await appointmentService.listAppointments() };
        if (disposed) return;
        set({ appointments: response.items, loading: false, error: null });
      } catch (error) {
        if (disposed) return;
        set({ loading: false, error: resolveAppointmentFetchError(error) });
      }
    };

    void refreshFromBackend();
    const refreshInterval = window.setInterval(() => {
      void refreshFromBackend();
    }, 30_000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refreshFromBackend();
      }
    };

    const handleWindowFocus = () => {
      void refreshFromBackend();
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleWindowFocus);
    }

    return () => {
      disposed = true;
      clearInterval(refreshInterval);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleWindowFocus);
      }
    };
  },
  setAppointmentPaid: async (appointmentId, setAppointmentPaidUseCase) => setAppointmentPaidUseCase(appointmentId),
  checkIfPastAppointment: async (appointmentId, checkIfPastAppointmentUseCase) => checkIfPastAppointmentUseCase(appointmentId),
  isPastAppointment: (date, time) => isPastAppointment(date, time),
  isAppointmentPast: (appointment) => isAppointmentPast(appointment, APPOINTMENT_DURATION_MINUTES),
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
