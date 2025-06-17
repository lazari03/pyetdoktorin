import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebaseconfig";
import { UserRole } from "../models/UserRole";

export async function isProfileIncomplete(role: UserRole, userId: string): Promise<boolean> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    console.warn("User not found");
    return true;
  }

  const userData = userSnap.data();
  const requiredFields =
    role === UserRole.Doctor
      ? ["name", "surname", "phoneNumber", "about", "specializations"]
      : ["name", "surname", "phoneNumber", "email"];

  return requiredFields.some((field) => !userData[field]);
}
