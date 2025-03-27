import { db } from '../../../config/firebaseconfig';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { isAuthenticated } from './authService';

export const fetchAppointments = async (status: string) => {
  const { userId, error } = isAuthenticated();
  if (error) {
    throw new Error(error);
  }

  const userRole = localStorage.getItem('userRole'); // "patient" or "doctor"
  const q = query(
    collection(db, 'appointments'),
    where(userRole === 'patient' ? 'patientId' : 'doctorId', '==', userId),
    where('status', '==', status)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const bookAppointment = async (appointmentData: {
  doctorId: number;
  appointmentType: string;
  preferredDate: string;
  notes: string;
  status: string;
}) => {
  const { userId, error } = isAuthenticated();
  if (error) {
    throw new Error(error);
  }

  const appointment = {
    ...appointmentData,
    patientId: userId,
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = await addDoc(collection(db, 'appointments'), appointment);
    console.log('Appointment successfully added with ID:', docRef.id); // Debugging log
    return { id: docRef.id, ...appointment };
  } catch (err) {
    console.error('Error adding appointment to Firestore:', err); // Improved error logging
    throw new Error('Failed to book appointment.');
  }
};
