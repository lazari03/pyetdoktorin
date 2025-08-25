import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebaseconfig";
import { Appointment } from "@/models/Appointment";
import { getAuth } from 'firebase/auth';
import { mapFirestoreAppointment } from '../utils/mapFirestoreAppointment';
import { getUserPhoneNumber } from './userService';
import { sendDoctorAppointmentRequestSMS } from './smsService';

export async function getUserRole(userId: string): Promise<string> {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.role || "patient";
    } else {

      return "patient";
    }
  } catch {
    return "patient";
  }
}

// Centralized fetchAppointments function
export async function fetchAppointments(userId: string, isDoctor: boolean): Promise<Appointment[]> {
  if (!userId) {
    throw new Error('User ID is missing');
  }
  try {
    const appointmentsRef = collection(db, "appointments");
    const q = query(
      appointmentsRef,
      where(isDoctor ? "doctorId" : "patientId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) =>
      mapFirestoreAppointment({
        id: doc.id,
        ...doc.data(),
      })
    );
  } catch (error) {

    throw error;
  }
}

export const bookAppointment = async (appointmentData: {
  doctorId: string;
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
    // Fetch doctor's phone number and send SMS
    const doctorPhone = await getUserPhoneNumber(appointmentData.doctorId);
    if (doctorPhone) {
      await sendDoctorAppointmentRequestSMS(doctorPhone, user.displayName || 'A patient');
    }
    return { id: docRef.id, ...appointment };
  } catch {
    throw new Error('Failed to book appointment.');
  }
};

export const markSlotAsPending = async (doctorId: string, date: string, time: string) => {
  const slotKey = `${date}_${time}`;
  const docRef = doc(db, 'calendars', doctorId);
  await updateDoc(docRef, {
    [`availability.${slotKey}`]: 'pending',
  });
};

export const markSlotAsBooked = async (doctorId: string, date: string, time: string) => {
  const slotKey = `${date}_${time}`;
  const docRef = doc(db, 'calendars', doctorId);
  await updateDoc(docRef, {
    [`availability.${slotKey}`]: 'booked',
  });
};

export const markSlotAsAvailable = async (doctorId: string, date: string, time: string) => {
  const slotKey = `${date}_${time}`;
  const docRef = doc(db, 'calendars', doctorId);
  await updateDoc(docRef, {
    [`availability.${slotKey}`]: 'available',
  });
};
