import { useState, useEffect } from "react";
import { db } from "../../config/firebaseconfig";
import { collection, doc, getDoc } from "firebase/firestore";

export function useAppointmentDetails(appointmentId: string | null) {
  const [patientName, setPatientName] = useState<string | null>(null);
  const [doctorName, setDoctorName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!appointmentId) return;

    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        // Fetch appointment details
        const appointmentRef = doc(collection(db, "appointments"), appointmentId);
        const appointmentSnap = await getDoc(appointmentRef);

        if (!appointmentSnap.exists()) {
          throw new Error("Appointment not found");
        }

        const { patientId, doctorId } = appointmentSnap.data();

        // Fetch patient name
        if (patientId) {
          const patientRef = doc(collection(db, "users"), patientId);
          const patientSnap = await getDoc(patientRef);
          if (patientSnap.exists()) {
            setPatientName(patientSnap.data().name);
          }
        }

        // Fetch doctor name
        if (doctorId) {
          const doctorRef = doc(collection(db, "users"), doctorId);
          const doctorSnap = await getDoc(doctorRef);
          if (doctorSnap.exists()) {
            setDoctorName(doctorSnap.data().name);
          }
        }
      } catch (err) {
        if (err instanceof Error) {
          console.error(`Error fetching appointment details: ${err.message}`);
          if (err.message.includes("Missing or insufficient permissions")) {
            setError(new Error("You do not have permission to access this data."));
          } else {
            setError(err);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [appointmentId]);

  return { patientName, doctorName, isLoading, error };
}
