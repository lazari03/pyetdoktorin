import { db } from '../config/firebaseconfig';
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Appointment } from '../models/Appointment'; // Import the Appointment type

const bookAppointment = async (appointmentData: {
  doctorId: number;
  appointmentType: string;
  preferredDate: string;
  notes: string;
  status: string;
}) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not authenticated. Please log in.");
  }

  const appointment = {
    ...appointmentData,
    patientId: user.uid,
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

const markSlotAsPending = async (doctorId: string, date: string, time: string) => {
  const slotKey = `${date}_${time}`;
  const docRef = doc(db, 'calendars', doctorId);

  await updateDoc(docRef, {
    [`availability.${slotKey}`]: 'pending',
  });
};

const markSlotAsBooked = async (doctorId: string, date: string, time: string) => {
  const slotKey = `${date}_${time}`;
  const docRef = doc(db, 'calendars', doctorId);

  await updateDoc(docRef, {
    [`availability.${slotKey}`]: 'booked',
  });
};

const markSlotAsAvailable = async (doctorId: string, date: string, time: string) => {
  const slotKey = `${date}_${time}`;
  const docRef = doc(db, 'calendars', doctorId);

  await updateDoc(docRef, {
    [`availability.${slotKey}`]: 'available',
  });
};
