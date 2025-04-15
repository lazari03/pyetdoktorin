import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../config/firebaseconfig';
import { doc, setDoc, getDocs, query, where, collection, addDoc } from 'firebase/firestore'; // Add getDocs, query, where
import { isAuthenticated, fetchUserDetails } from '../services/authService';
import { addMinutes, format, isSameDay, isBefore, startOfDay } from 'date-fns';
import { useNewAppointmentStore } from '@/store/newAppointmentStore';
import { Appointment } from '@/models/Appointment';

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
  const [patientName, setPatientName] = useState<string>(''); // State for patient name
  const [loading, setLoading] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<{ time: string; disabled: boolean }[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Automatically fetch the patient name when the hook is initialized
    isAuthenticated(async (authState) => {
      if (authState.userId) {
        const userDetails = await fetchUserDetails(authState.userId); // Fetch user details
        if (userDetails?.name) {
          setPatientName(userDetails.name); // Set the patient name from user details
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
    } catch (error) {
      console.error('Error checking appointment existence:', error);
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
      console.error('Submission in progress or no doctor selected');
      return;
    }

    setIsSubmitting(true);

    const appointmentData: Omit<Appointment, 'id'> = {
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      patientId: '', // Replace with actual user ID from context
      appointmentType,
      preferredDate,
      preferredTime,
      notes,
      isPaid: false,
      createdAt: new Date().toISOString(),
    };

    try {
      const exists = await checkAppointmentExists(
        appointmentData.patientId,
        appointmentData.doctorId,
        appointmentData.preferredDate,
        appointmentData.preferredTime
      );

      if (exists) {
        console.error('Appointment already exists for the selected time and date');
        setIsSubmitting(false);
        return;
      }

      await addDoc(collection(db, 'appointments'), appointmentData);
      console.log('Appointment successfully saved:', appointmentData);
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
    } catch (error) {
      console.error('Error saving appointment:', error);
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
    patientName, // Expose patient name state
    loading,
    availableTimes,
  };
}