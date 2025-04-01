import { collection, getDocs, query, where, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '../../..//config/firebaseconfig';

export interface Doctor {
  id: string;
  name: string;
  specializations: string[];
  expertise?: string[];
  [key: string]: any; // Allow additional fields
}

/**
 * Fetch doctors based on a search term.
 * @param term - The search term (e.g., name or specializations).
 * @returns A promise that resolves to an array of doctors.
 */
export async function fetchDoctors(term: string): Promise<Doctor[]> {
  const doctorsCollection = collection(db, 'users');

  try {
    // Normalize the search term for case-insensitive matching
    const normalizedTerm = term.toLowerCase();

    // Query all doctors
    const doctorQuery = query(
      doctorsCollection,
      where('role', '==', 'doctor')
    );

    // Execute the query
    const snapshot = await getDocs(doctorQuery);

    // Map the results
    const doctors = snapshot.docs.map((doc: QueryDocumentSnapshot) => {
      const data = doc.data() as Doctor;
      return {
        ...data,
      };
    });

    // Filter results by name or specializations
    const filteredDoctors = doctors.map((doc) => ({
      id: doc.id,
      name: doc.name || 'Unknown',
      specializations: doc.specializations?.map((spec: string) => spec.toLowerCase()) || [], // Normalize specializations to lowercase
    })).filter((doc) => {
      const matchesName = doc.name.toLowerCase().includes(normalizedTerm);
      const matchesSpecializations = doc.specializations.some((spec) => spec.includes(normalizedTerm));
      return matchesName || matchesSpecializations; // Match either name or specializations
    });

    return filteredDoctors;
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw new Error('Failed to fetch doctors');
  }
}