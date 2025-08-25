import { UserRole } from '../models/UserRole';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseconfig';

export async function isProfileIncomplete(role: UserRole, userId: string): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId); // Adjust the collection name if needed
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {

      return true;
    }

    const userData = userSnap.data();

    switch (role) {
      case UserRole.Doctor:
        return ['name', 'surname', 'phoneNumber', 'about', 'specializations'].some(
          (field) => !userData[field]
        );
      case UserRole.Patient:
        return ['name', 'surname', 'phoneNumber', 'email'].some(
          (field) => !userData[field]
        );
      default:
        return true;
    }
  } catch {
    return true; // Assume incomplete if there's an error
  }
}
