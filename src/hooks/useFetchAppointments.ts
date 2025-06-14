import { useEffect, useCallback } from "react";
import { useAppointmentStore } from "../store/appointmentStore";
import { fetchAppointments, getUserRole } from "../services/appointmentsService";

export const useFetchAppointments = (user: { uid: string } | null) => {
  const { setAppointments, setIsDoctor } = useAppointmentStore();

  // Extract fetch logic so it can be called on demand
  const fetchAndSetAppointments = useCallback(async () => {
    if (!user || !user.uid) {
      console.error('User is not authenticated or user ID is missing');
      setAppointments([]);
      setIsDoctor(null);
      return;
    }

    try {
      const userRole = await getUserRole(user.uid); // Centralized role check
      console.log("Fetched user role:", userRole);
      const isDoctor = userRole === 'doctor';
      setIsDoctor(isDoctor);

      const appointments = await fetchAppointments(user.uid, isDoctor);
      const mappedAppointments = appointments.map((appointment) => ({
        id: appointment.id,
        doctorId: "doctorId" in appointment ? appointment.doctorId : "",
        doctorName: "doctorName" in appointment ? appointment.doctorName : "Unknown",
        patientId: "patientId" in appointment ? appointment.patientId : "",
        patientName: "patientName" in appointment ? appointment.patientName : "Unknown",
        appointmentType: "appointmentType" in appointment ? appointment.appointmentType : "General",
        preferredDate: "preferredDate" in appointment ? appointment.preferredDate : "",
        preferredTime: "preferredTime" in appointment ? appointment.preferredTime : "",
        notes: "notes" in appointment ? appointment.notes : "",
        isPaid: "isPaid" in appointment ? appointment.isPaid : false,
        createdAt: "createdAt" in appointment ? appointment.createdAt : new Date().toISOString(),
        status: "status" in appointment ? appointment.status : "pending",
      })); // Ensure all required fields are present
      console.log("Mapped appointments:", mappedAppointments);
      setAppointments(mappedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  }, [user, setAppointments, setIsDoctor]);

  useEffect(() => {
    fetchAndSetAppointments();
  }, [fetchAndSetAppointments]);

  // Return a refetch function for manual refresh
  return { refetch: fetchAndSetAppointments };
};
