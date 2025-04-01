import { useEffect, useState } from "react";
import { db } from "../../../config/firebaseconfig";
import { doc, getDoc, collection } from "firebase/firestore";
import { useAppointments } from "./useAppointments";
import { useAuth } from "../../context/AuthContext";

export const useAppointmentsPage = () => {
  const { user, role, loading: authLoading } = useAuth(); // Access AuthContext
  const { appointments, isLoading, error } = useAppointments(); // Access appointments
  const [appointmentDetails, setAppointmentDetails] = useState<
    { id: string; patientName: string | null; doctorName: string | null; isPaid: boolean }[]
  >([]);

  // Fetch appointment details
  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      const details = await Promise.all(
        appointments.map(async (appointment) => {
          try {
            const appointmentRef = doc(collection(db, "appointments"), appointment.id);
            const appointmentSnap = await getDoc(appointmentRef);

            if (!appointmentSnap.exists()) {
              throw new Error("Appointment not found");
            }

            const { patientId, doctorId, isPaid } = appointmentSnap.data();

            let patientName: string | null = null;
            let doctorName: string | null = null;

            if (patientId) {
              const patientRef = doc(collection(db, "users"), patientId);
              const patientSnap = await getDoc(patientRef);
              if (patientSnap.exists()) {
                patientName = patientSnap.data().name;
              }
            }

            if (doctorId) {
              const doctorRef = doc(collection(db, "users"), doctorId);
              const doctorSnap = await getDoc(doctorRef);
              if (doctorSnap.exists()) {
                doctorName = doctorSnap.data().name;
              }
            }

            return { 
              id: appointment.id, 
              patientName, 
              doctorName, 
              isPaid: isPaid ?? false // Ensure isPaid defaults to false if not present
            };
          } catch (err) {
            console.error(`Error fetching details for appointment ${appointment.id}:`, err);
            return { id: appointment.id, patientName: null, doctorName: null, isPaid: false };
          }
        })
      );
      setAppointmentDetails(details);
    };

    if (appointments.length > 0) {
      fetchAppointmentDetails();
    }
  }, [appointments]);

  return {
    user,
    role,
    authLoading,
    appointments,
    isLoading,
    error,
    appointmentDetails,
  };
};