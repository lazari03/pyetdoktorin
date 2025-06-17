import { doc, updateDoc, collection } from "firebase/firestore";
import { db } from "../config/firebaseconfig";

export async function updateAppointmentStatus(appointmentId: string, status: "accepted" | "rejected") {
  const appointmentRef = doc(collection(db, "appointments"), appointmentId);
  await updateDoc(appointmentRef, { status });
}
