import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebaseconfig";

export interface Doctor {
  id: string;
  name: string;
  specializations: string[];
  expertise?: string[];
  [key: string]: any; // Allow additional fields
}

export async function fetchDoctors(searchTerm: string, searchType: 'name' | 'expertise'): Promise<Doctor[]> {
  try {
    const doctorsCollection = collection(db, "users");

    // Handle empty or invalid search terms
    if (!searchTerm.trim()) {
      return [];
    }

    let doctorQuery;

    // Construct the query based on the search type
    if (searchType === 'name') {
      doctorQuery = query(
        doctorsCollection,
        where("role", "==", "doctor"),
        where("name", ">=", searchTerm),
        where("name", "<=", searchTerm + "\uf8ff")
      );
    } else if (searchType === 'expertise') {
      doctorQuery = query(
        doctorsCollection,
        where("role", "==", "doctor"),
        where("expertise", "array-contains", searchTerm)
      );
    } else {
      throw new Error("Invalid search type. Use 'name' or 'expertise'.");
    }

    // Execute the query
    const snapshot = await getDocs(doctorQuery);

    // Handle empty results
    if (snapshot.empty) {
      console.warn("No doctors found for searchTerm:", searchTerm);
      return [];
    }

    // Map the results to the Doctor interface
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        specializations: data.specializations || [],
        expertise: data.expertise || [],
        ...data,
      } as Doctor;
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    throw new Error("Failed to fetch doctors");
  }
}