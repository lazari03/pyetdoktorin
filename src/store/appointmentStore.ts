import { create } from 'zustand';
import { useEffect } from 'react';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../config/firebaseconfig';

interface Appointment {
  id: string;
  date: string;
  doctor: string;
  status: string;
}

interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  fetchAppointments: (uid: string) => void;
}

export const useAppointmentStore = create<AppointmentState>((set) => ({
  appointments: [],
  loading: false,
  error: null,
  fetchAppointments: async (uid: string) => {
    set({ loading: true, error: null });
    try {
      const appointmentQuery = query(collection(db, 'appointments'), where('uid', '==', uid));
      const snapshot = await getDocs(appointmentQuery);
      const appointments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Appointment[];
      set({ appointments, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch appointments', loading: false });
    }
  },
}));

export function useInitializeAppointments(uid: string) {
  const fetchAppointments = useAppointmentStore((state) => state.fetchAppointments);

  useEffect(() => {
    if (uid) {
      fetchAppointments(uid);
    }
  }, [uid, fetchAppointments]);
}
