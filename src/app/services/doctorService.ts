import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../config/firebaseconfig";
import { FirebaseError } from "firebase/app";

export const fetchDoctors = async (searchTerm: string = "") => {
  try {
    const doctorsCollection = collection(db, "users"); // Fetch from 'users' collection
    const constraints = searchTerm
      ? [
          where("education.role", "==", "doctor"), // Filter by role
          where("education.name", ">=", searchTerm),
          where("education.name", "<=", searchTerm + "\uf8ff"),
        ]
      : [where("education.role", "==", "doctor")]; // Fetch all doctors if no search term

    const q = query(doctorsCollection, ...constraints);
    const querySnapshot = await getDocs(q);

    const doctors = querySnapshot.docs.map((doc) => ({
      id: doc.id, // Use Firebase UUID as the ID
      name: doc.data().education.name || "Unknown",
      surname: doc.data().education.surname || "",
      email: doc.data().education.email || "",
      phoneNumber: doc.data().education.phoneNumber || "",
      specializations: doc.data().specializations || [],
      about: doc.data().about || "",
    }));

    return doctors;
  } catch (error) {
    console.error("Error fetching doctors:", error);

    if (error instanceof FirebaseError) {
      throw new Error(`Firebase error: ${error.message}`);
    } else {
      throw new Error("An unexpected error occurred while fetching doctors.");
    }
  }
};
