import { db } from '../../config/firebaseconfig';
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const fetchAppointments = async (status: string) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.error("Error: User not authenticated.");
    throw new Error("User not authenticated. Please log in.");
  }

  const userId = user.uid;
  const userRole = localStorage.getItem('userRole'); // "patient" or "doctor"
  if (!userRole) {
    console.warn("Warning: User role not found in localStorage. Defaulting to 'patient'.");
    throw new Error("User role not found in localStorage."); // Optional: Remove this line if defaulting is acceptable
  }

  const baseQuery = query(
    collection(db, 'appointments'),
    where(userRole === 'patient' ? 'patientId' : 'doctorId', '==', userId)
  );

  const q = status === "all" ? baseQuery : query(baseQuery, where('status', '==', status));

  try {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.warn("No appointments found for the given query.");
    }
    const appointments = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      createdAt: doc.data().createdAt || "",
      appointmentType: doc.data().appointmentType || "",
      notes: doc.data().notes || "",
      status: doc.data().status || "pending",
      preferredDate: doc.data().preferredDate || undefined,
      preferredTime: doc.data().preferredTime || undefined,
      doctorName: doc.data().doctorName || "Unknown",
      patientName: doc.data().patientName || "Unknown",
    }));
    return appointments;
  } catch (error) {
    console.error("Error fetching appointments from Firestore:", error);
    throw new Error("Failed to fetch appointments.");
  }
};

export const bookAppointment = async (appointmentData: {
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
