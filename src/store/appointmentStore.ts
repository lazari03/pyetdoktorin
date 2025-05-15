import { create } from "zustand";
import { fetchAppointments } from "../services/appointmentService";
import { Appointment } from "../models/Appointment";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import app from "../config/firebaseconfig";
import {
  AppointmentActionVariant,
  AppointmentActionLabels,
  getAppointmentAction
  } from "./appointmentActionButton";

const db = getFirestore(app);

interface AppointmentState {
  appointments: Appointment[];
  isDoctor: boolean | null;
  loading: boolean;
  error: string | null;
  setAppointments: (appointments: Appointment[]) => void;
  setIsDoctor: (isDoctor: boolean | null) => void;
  fetchAppointments: (userId: string, isDoctor: boolean) => Promise<void>;
  setAppointmentPaid: (appointmentId: string) => void;
  handlePayNow: (appointmentId: string, amount: number) => Promise<void>;
  isPastAppointment: (date: string, time: string) => boolean;
  checkIfPastAppointment: (appointmentId: string) => Promise<boolean>;
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
  fetchAppointments: async (userId: string, isDoctor: boolean) => {
    set({ loading: true, error: null });
    try {
      const fetchedAppointments: Appointment[] = await fetchAppointments(userId, isDoctor);
      const updatedAppointments = fetchedAppointments.map((appointment) => {
        const appointmentDateTime = new Date(`${appointment.preferredDate}T${appointment.preferredTime}`);
        const isPast = appointmentDateTime < new Date();
        return { ...appointment, isPast };
      });
      set({ appointments: updatedAppointments, loading: false });
    } catch {
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
  handlePayNow: async (appointmentId, amount) => {
    try {
      const response = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appointmentId, amount }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const { url } = await response.json();

      window.location.href = url; // Redirect to Stripe payment page
    } catch (error) {
      console.error("Error processing payment:", error);
    }
  },
  isPastAppointment: (date, time) => {
    const appointmentDateTime = new Date(`${date}T${time}`);
    return appointmentDateTime < new Date();
  },
  checkIfPastAppointment: async (appointmentId) => {
    try {
      const appointmentRef = doc(db, "appointments", appointmentId);
      const appointmentDoc = await getDoc(appointmentRef);

      if (!appointmentDoc.exists()) {
        console.error("Appointment not found in Firestore");
        return false;
      }

      const appointmentData = appointmentDoc.data();
      const appointmentDateTime = new Date(`${appointmentData.preferredDate}T${appointmentData.preferredTime}`);

      return appointmentDateTime < new Date();
    } catch (error) {
      console.error("Error checking if appointment is in the past:", error);
      return false;
    }
  },
  isAppointmentPast: (appointment) => {
    const appointmentDateTime = new Date(`${appointment.preferredDate}T${appointment.preferredTime}`);
    return appointmentDateTime < new Date();
  },
  getAppointmentAction: (appointment) => getAppointmentAction(appointment, get().isAppointmentPast),
}));

export const useInitializeAppointments = () => {
  const { fetchAppointments, setIsDoctor } = useAppointmentStore();
  return async (userId: string, isDoctor: boolean) => {
    setIsDoctor(isDoctor);
    await fetchAppointments(userId, isDoctor);
  };
};
