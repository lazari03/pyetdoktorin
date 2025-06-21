import { useState, useEffect } from "react";
import { fetchAppointments } from "../services/appointmentsService";
import { db } from "../config/firebaseconfig";
import { useAuth } from "../context/AuthContext";

interface Appointment {
  id: string;
  createdAt: string;
  appointmentType: string;
  notes: string;
  status: "pending" | "completed" | "canceled";
  preferredDate?: string;
  preferredTime?: string;
  doctorName?: string;
  doctorId?: string;
  patientId?: string;
  isPaid?: boolean;
  sessionEnded?: string;
  start?: Date | null;
  end?: Date | null;
}

export function useAppointments() {
  const { user, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.uid) {
      setError("User is not authenticated");
      setIsLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        // Use centralized fetchAppointments
        const doctorAppointments = await fetchAppointments(user.uid, true);
        const patientAppointments = await fetchAppointments(user.uid, false);
        // Merge and deduplicate appointments by id
        // Map status to the correct union type
        const allAppointments = [...doctorAppointments, ...patientAppointments]
          .filter((a, i, arr) => arr.findIndex(b => b.id === a.id) === i)
          .map((appointment) => ({
            ...appointment,
            status: ["pending", "completed", "canceled"].includes(appointment.status)
              ? (appointment.status as "pending" | "completed" | "canceled")
              : "pending",
          }));
        setAppointments(allAppointments);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to fetch appointments");
        setIsLoading(false);
      }
    };
    fetchData();
  }, [authLoading, user]);

  return { appointments, isLoading, error };
}
