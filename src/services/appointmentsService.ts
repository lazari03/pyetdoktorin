import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebaseconfig";

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

export async function fetchAppointments(userId: string, isDoctor: boolean) {
  try {
    const q = query(
      collection(db, "appointments"),
      where(isDoctor ? "doctorId" : "patientId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }
}
