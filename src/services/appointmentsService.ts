import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebaseconfig";
import { Appointment } from "@/models/Appointment";

export async function getUserRole(userId: string): Promise<string> {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.role || "patient";
    } else {
      console.error("User document does not exist.");
      return "patient";
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
    return "patient";
  }
}

export async function fetchAppointments(userId: string, isDoctor: boolean): Promise<Appointment[]> {
  const appointmentsRef = collection(db, "appointments");
  const q = query(
    appointmentsRef,
    where(isDoctor ? "doctorId" : "patientId", "==", userId)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      doctorId: data.doctorId || "",
      doctorName: data.doctorName || "Unknown",
      patientId: data.patientId || "",
      patientName: data.patientName || "Unknown",
      appointmentType: data.appointmentType || "General",
      preferredDate: data.preferredDate || "",
      preferredTime: data.preferredTime || "",
      notes: data.notes || "",
      isPaid: data.isPaid || false,
      createdAt: data.createdAt || new Date().toISOString(),
      status: data.status || "pending",
    } as Appointment; // Ensure the return type matches Appointment
  });
}
