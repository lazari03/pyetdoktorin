import { useState, useEffect } from "react";
import { collection, query, where, getDocs, or, doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebaseconfig";
import { auth } from "../config/firebaseconfig"; // Import Firebase auth
import { onAuthStateChanged } from "firebase/auth"; // Import auth state listener

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

export async function fetchDoctorId(doctorId: string) {
  try {
    const doctorDoc = await getDoc(doc(db, 'doctors', doctorId));
    if (doctorDoc.exists()) {
      return doctorDoc.id; // Return the valid doctor ID
    } else {
      console.error('Doctor not found in the database.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching doctor ID:', error);
    return null;
  }
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async (userId: string) => {
      try {
        const appointmentsQuery = query(
          collection(db, "appointments"),
          or(
            where("doctorId", "==", userId),
            where("patientId", "==", userId)
          )
        );

        const querySnapshot = await getDocs(appointmentsQuery);
        const fetchedAppointments = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const startDateTime = data.preferredDate && data.preferredTime
            ? new Date(`${data.preferredDate}T${data.preferredTime}`)
            : null;

          const endDateTime = startDateTime
            ? new Date(startDateTime.getTime() + 30 * 60 * 1000) // Add 30 minutes to start time
            : null;

          return {
            id: doc.id,
            createdAt: data.createdAt || "",
            appointmentType: data.appointmentType || "",
            notes: data.notes || "",
            status: data.status || "pending",
            preferredDate: data.preferredDate || undefined,
            preferredTime: data.preferredTime || undefined,
            doctorName: data.doctorName || "N/A",
            doctorId: data.doctorId || "",
            patientId: data.patientId || "",
            isPaid: data.isPaid || false,
            sessionEnded: data.sessionEnded,
            start: startDateTime, // Ensure this is a valid Date object
            end: endDateTime,     // Ensure this is a valid Date object
          } as Appointment;
        });

        setAppointments(fetchedAppointments);
      } catch (fetchError) {
        setError(
          "Error loading appointments: " +
          (fetchError instanceof Error ? fetchError.message : "Unknown error")
        );
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchAppointments(user.uid);
      } else {
        setError("User is not authenticated");
        setIsLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup the auth state listener
  }, []);

  return { appointments, isLoading, error, fetchDoctorId };
}
