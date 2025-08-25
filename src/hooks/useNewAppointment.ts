import { useState, useEffect } from 'react';
import { getDocs, query, where, collection, addDoc } from 'firebase/firestore'; // Removed unused `doc` and `setDoc`
import { isAuthenticated, fetchUserDetails } from '../services/authService';
import { addMinutes, format, isSameDay, isBefore, startOfDay } from 'date-fns';
import { useNewAppointmentStore } from '@/store/newAppointmentStore';
import { Appointment } from '@/models/Appointment';
import { useAuth } from '../context/AuthContext'; // Use the hook instead of direct context
import { db } from '@/config/firebaseconfig';

export default function useNewAppointment() {
  const {
    selectedDoctor,
    setSelectedDoctor,
    appointmentType,
    setAppointmentType,
    preferredDate,
    setPreferredDate,
    preferredTime,
    setPreferredTime,
    notes,
    setNotes,
    resetAppointment,
  } = useNewAppointmentStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading] = useState(false); // Remove setLoading as it is unused
  const [patientName, setPatientName] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<{ time: string; disabled: boolean }[]>(); // Removed `loading` state
  const { user } = useAuth(); // Use the hook here

  useEffect(() => {
    isAuthenticated(async (authState) => {
      if (authState.userId) {
        const userDetails = await fetchUserDetails(authState.userId);
        if (userDetails?.name) {
          setPatientName(userDetails.name);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (preferredDate) {
      const now = new Date();
      const selectedDate = startOfDay(new Date(preferredDate));
      const times: { time: string; disabled: boolean }[] = [];

      for (let minutes = 0; minutes < 24 * 60; minutes += 30) {
        const time = addMinutes(selectedDate, minutes);
        const formattedTime = format(time, 'hh:mm a');
        const isDisabled = isSameDay(time, now) && isBefore(time, now);

        times.push({
          time: formattedTime,
          disabled: isDisabled,
        });
      }

      setAvailableTimes(times);
    } else {
      setAvailableTimes([]);
    }
  }, [preferredDate]);

  const checkAppointmentExists = async (
    patientId: string,
    doctorId: string,
    preferredDate: string,
    preferredTime: string
  ): Promise<boolean> => {
    try {
      const appointmentsRef = collection(db, 'appointments');
      const q = query(
        appointmentsRef,
        where('patientId', '==', patientId),
        where('doctorId', '==', doctorId),
        where('preferredDate', '==', preferredDate),
        where('preferredTime', '==', preferredTime)
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (
    e: React.FormEvent,
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
    setProgress: React.Dispatch<React.SetStateAction<number>>
  ) => {
    e.preventDefault();

    if (isSubmitting || !selectedDoctor) {

      return;
    }

    if (!user || !user.uid || !user.name) {

      return;
    }

    setIsSubmitting(true);

    const appointmentData: Omit<Appointment, 'id'> = {
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      patientId: user.uid, // Use the authenticated user's UID
      patientName: user.name, // Use the logged-in user's name
      appointmentType,
      preferredDate,
      preferredTime,
      notes,
      isPaid: false,
      createdAt: new Date().toISOString(),
      status: "pending", // Add the missing status property
    };


    try {
      const exists = await checkAppointmentExists(
        appointmentData.patientId,
        appointmentData.doctorId,
        appointmentData.preferredDate,
        appointmentData.preferredTime
      );

      if (exists) {

        setIsSubmitting(false);
        return;
      }

      await addDoc(collection(db, 'appointments'), appointmentData);
      // Notify doctor via SMS
      await fetch('/api/sms/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'appointment-request',
          doctorId: appointmentData.doctorId,
          patientName: appointmentData.patientName,
        }),
      });
      resetAppointment();
      setShowModal(true);

      let progressValue = 100;
      const interval = setInterval(() => {
        progressValue -= 10;
        setProgress(progressValue);
        if (progressValue <= 0) {
          clearInterval(interval);
        }
      }, 300);
    } catch {
      setIsSubmitting(false);
    }
  };

  return {
    selectedDoctor,
    setSelectedDoctor,
    appointmentType,
    setAppointmentType,
    preferredDate,
    setPreferredDate,
    preferredTime,
    setPreferredTime,
    notes,
    setNotes,
    resetAppointment,
    handleSubmit,
    isSubmitting,
    loading, // Return loading
    patientName,
    availableTimes,
  };
}