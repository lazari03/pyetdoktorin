import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebaseconfig";
import { Appointment } from "../store/appointmentsStore"; // Import the Appointment interface

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
  try {
    const q = query(
      collection(db, "appointments"),
      where(isDoctor ? "doctorId" : "patientId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Appointment, "id">), // Ensure the data matches the Appointment interface
    }));
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }
}
