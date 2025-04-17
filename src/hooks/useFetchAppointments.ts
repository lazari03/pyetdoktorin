import { useEffect } from "react";
import { useAppointmentStore } from "../store/appointmentStore";
import { fetchAppointments, getUserRole } from "../services/appointmentsService";

export const useFetchAppointments = (user: { uid: string } | null) => {
  const { setAppointments, setIsDoctor } = useAppointmentStore();

  useEffect(() => {
    const fetchAndSetAppointments = async () => {
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
        console.log("Fetched appointments:", appointments);
        setAppointments(appointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    fetchAndSetAppointments();
  }, [user, setAppointments, setIsDoctor]);
};
