import { create } from "zustand";
import { fetchAppointments } from "../services/appointmentService";
import { Appointment } from "../models/Appointment";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import app from "../config/firebaseconfig";
import { getAppointmentAction } from "./appointmentActionButton";

const db = getFirestore(app);

interface AppointmentState {
  appointments: Appointment[];
  isDoctor: boolean | null;
  loading: boolean;
  error: string | null;
  setAppointments: (appointments: Appointment[]) => void;
  setIsDoctor: (isDoctor: boolean | null) => void;
  fetchAppointments: (userId: string, isDoctor: boolean) => Promise<void>;
  setAppointmentPaid: (appointmentId: string) => Promise<void>;
  handlePayNow: (appointmentId: string, amount: number) => Promise<void>;
  isPastAppointment: (date: string, time: string) => boolean;
  checkIfPastAppointment: (appointmentId: string) => Promise<boolean>;
  isAppointmentPast: (appointment: Appointment) => boolean;
  getAppointmentAction: (appointment: Appointment) => { label: string; disabled: boolean; variant: string };
  verifyStripePayment: (appointmentId: string) => Promise<void>;
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
        const appointmentEndTime = new Date(appointmentDateTime.getTime() + 30 * 60000); // plus 30 min
        const isPast = appointmentEndTime < new Date();
        return { ...appointment, isPast };
      });
      set({ appointments: updatedAppointments, loading: false });
    } catch {
      set({ error: "Failed to fetch appointments", loading: false });
    }
  },
  setAppointmentPaid: async (appointmentId) => {
    try {
      const appointmentRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentRef, { isPaid: true });
    } catch (error) {
      console.error("Failed to update isPaid in Firestore:", error);
    }
  },
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
    const appointmentEndTime = new Date(appointmentDateTime.getTime() + 30 * 60000); // plus 30 min
    return appointmentEndTime < new Date();
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
      const appointmentEndTime = new Date(appointmentDateTime.getTime() + 30 * 60000); // plus 30 min

      return appointmentEndTime < new Date();
    } catch (error) {
      console.error("Error checking if appointment is in the past:", error);
      return false;
    }
  },
  isAppointmentPast: (appointment) => {
    const appointmentDateTime = new Date(`${appointment.preferredDate}T${appointment.preferredTime}`);
    const appointmentEndTime = new Date(appointmentDateTime.getTime() + 30 * 60000); // plus 30 min
    return appointmentEndTime < new Date();
  },
  getAppointmentAction: (appointment) => getAppointmentAction(appointment, get().isAppointmentPast),
  verifyStripePayment: async (appointmentId: string) => {
    try {
      // Call your backend to verify payment status after Stripe redirect
      const response = await fetch(`/api/stripe/verify-payment?appointmentId=${appointmentId}`);
      if (!response.ok) {
        throw new Error("Failed to verify payment");
      }
      const { isPaid } = await response.json();
      if (isPaid) {
        // Update both store and Firestore using the store method
        await get().setAppointmentPaid(appointmentId);
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
    }
  },
}));

export const useInitializeAppointments = () => {
  const { fetchAppointments, setIsDoctor } = useAppointmentStore();
  return async (userId: string, isDoctor: boolean) => {
    setIsDoctor(isDoctor);
    await fetchAppointments(userId, isDoctor);
  };
};
