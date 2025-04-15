import { useEffect } from "react";
import { useAppointmentStore } from "../store/appointmentStore";
import { fetchAppointments, getUserRole } from "../services/appointmentsService";

export const useFetchAppointments = (user: { uid: string } | null) => {
  const { setAppointments, setIsDoctor } = useAppointmentStore();

  useEffect(() => {
    if (user) {
      const initialize = async () => {
        // Determine if the user is a doctor
        const userRole = await getUserRole(user.uid);
        const isDoctor = userRole === "doctor";
        setIsDoctor(isDoctor);

        // Fetch appointments
        const fetchedAppointments = await fetchAppointments(user.uid, isDoctor);
        setAppointments(fetchedAppointments);
      };

      initialize();
    }
  }, [user, setAppointments, setIsDoctor]);
};
