import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebaseconfig";
import { Doctor } from "../models/Doctor"; 
import { FirestoreCollections, DoctorFields, SearchType } from "../models/FirestoreConstants";

export async function fetchDoctors(searchTerm: string, searchType: SearchType): Promise<Doctor[]> {
  try {
    const doctorsCollection = collection(db, FirestoreCollections.Users);

    if (!searchTerm.trim()) {
      return [];
    }

    const normalizedSearchTerm = searchTerm.toLowerCase();
    const doctorQuery = query(
      doctorsCollection,
      where(DoctorFields.Role, "==", DoctorFields.RoleDoctor)
    );

    // Execute the query to get all doctors
    const snapshot = await getDocs(doctorQuery);

    if (snapshot.empty) {
      console.warn(`No doctors found`);
      return [];
    }

    // Map the results to the Doctor interface
    const doctors = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data[DoctorFields.Name] || "",
        specialization: data[DoctorFields.Specializations] || [],
        ...data,
      } as Doctor;
    });

    // Filter results based on search type and ensure case-insensitive comparison
    if (searchType === SearchType.Name) {
      return doctors.filter(doctor => {
        // Case-insensitive comparison for name
        return doctor.name && doctor.name.toLowerCase().includes(normalizedSearchTerm);
      });
    } else if (searchType === SearchType.Specializations) {
      return doctors.filter(doctor => {
        if (!doctor.specialization || doctor.specialization.length === 0) return false;
        
        // Case-insensitive comparison for each specialization
        return doctor.specialization.some(spec => 
          spec && spec.toLowerCase().includes(normalizedSearchTerm)
        );
      });
    }

    return doctors;
  } catch (error) {
    console.error("Error fetching doctors:", error);
    throw new Error("Failed to fetch doctors");
  }
}