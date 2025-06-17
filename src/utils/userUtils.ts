import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebaseconfig";

export async function fetchUserRole(userId: string): Promise<string | null> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data().role || null;
  }
  console.warn("User not found");
  return null;
}
