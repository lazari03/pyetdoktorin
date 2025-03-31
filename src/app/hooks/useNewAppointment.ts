import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../../../config/firebaseconfig';
import { doc, setDoc } from 'firebase/firestore';
import { isAuthenticated } from '../services/authService';
import { addMinutes, format, isSameDay, isBefore, startOfDay } from 'date-fns';

export default function useNewAppointment() {
  const [selectedDoctor, setSelectedDoctor] = useState<{ id: string; name: string } | null>(null);
  const [appointmentType, setAppointmentType] = useState<string>('Check-up');
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [preferredTime, setPreferredTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<{ time: string; disabled: boolean }[]>([]);
  const router = useRouter();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let userId: string | null = null;
    let error: string | null = null;

    await new Promise<void>((resolve) => {
      isAuthenticated((authState) => {
        userId = authState.userId; // Fetch and set the patient ID
        error = authState.error;
        resolve();
      });
    });

    if (error) {
      alert(error);
      return;
    }

    if (!userId) {
      alert('Failed to fetch patient ID. Please try again.');
      return;
    }

    if (!selectedDoctor) {
      alert('Please select a doctor.');
      return;
    }

    setLoading(true);
    try {
      const appointmentId = `${userId}_${selectedDoctor.id}_${Date.now()}`;
      await setDoc(doc(db, 'appointments', appointmentId), {
        patientId: userId, // Ensure patient ID is passed here
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        appointmentType,
        preferredDate,
        preferredTime,
        notes,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      alert('Appointment scheduled successfully!');
      router.push('/dashboard/');
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      alert('Failed to schedule appointment.');
    } finally {
      setLoading(false);
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
    loading,
    availableTimes,
    handleSubmit,
  };
}
