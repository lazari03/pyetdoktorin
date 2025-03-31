import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../..//config/firebaseconfig';

export interface Doctor {
  id: string;
  name: string;
  specializations: string[];
  [key: string]: any; // Allow additional fields
}

export async function fetchDoctors(term: string): Promise<Doctor[]> {
  const doctorsCollection = collection(db, 'users');
  const q = query(
    doctorsCollection,
    where('role', '==', 'doctor'),
    where('name', '>=', term),
    where('name', '<=', term + '\uf8ff')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || 'Unknown', // Ensure name exists
      specializations: data.specializations || [], // Default to an empty array
      ...data,
    } as Doctor;
  });
}
