import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../../../config/firebaseconfig';
import { doc, setDoc } from 'firebase/firestore';
import { isAuthenticated, fetchUserDetails } from '../services/authService'; // Import fetchUserDetails
import { addMinutes, format, isSameDay, isBefore, startOfDay } from 'date-fns';

export default function useNewAppointment() {
  const [selectedDoctor, setSelectedDoctor] = useState<{ id: string; name: string } | null>(null);
  const [appointmentType, setAppointmentType] = useState<string>('Check-up');
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [preferredTime, setPreferredTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Validate required fields
    if (!selectedDoctor) {
      alert('Please select a doctor.');
      return;
    }
  
    if (!preferredDate || !preferredTime) {
      alert('Please select a date and time.');
      return;
    }
  
    setLoading(true);
  
    try {
      // Fetch authenticated user ID
      const userId = await new Promise<string>((resolve, reject) => {
        isAuthenticated((authState) => {
          if (authState.userId) {
            resolve(authState.userId);
          } else {
            reject(authState.error || 'User is not authenticated.');
          }
        });
      });
  
      // Construct appointment data
      const appointmentId = `${userId}_${selectedDoctor.id}_${Date.now()}`;
      const appointmentData = {
        patientId: userId,
        patientName, // Ensure patient name is included
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        appointmentType,
        preferredDate,
        preferredTime,
        notes,
        status: 'pending',
        isPaid: false, // Add isPaid field with default value
        createdAt: new Date().toISOString(),
      };
  
      console.log('Attempting to create appointment with data:', appointmentData);
  
      // Save appointment to Firestore
      await setDoc(doc(db, 'appointments', appointmentId), appointmentData);
  
      // Construct notification data
      const notificationData = {
        doctorId: selectedDoctor.id,
        message: `New appointment from ${patientName}`, // Include patient name in the notification
        appointmentId,
        status: 'unread',
        createdAt: new Date().toISOString(),
      };
  
      console.log('Attempting to create notification with data:', notificationData);
  
      // Save notification to Firestore
      await setDoc(doc(db, 'notifications', `${selectedDoctor.id}_${appointmentId}`), notificationData);
  
      alert('Appointment scheduled successfully!');
      router.push('/dashboard/');
    } catch (error: any) {
      console.error('Error creating appointment:', error);
  
      if (error.code === 'permission-denied') {
        alert('You do not have permission to perform this action. Please contact support.');
      } else if (error.code === 'unavailable') {
        alert('Network issue detected. Please try again later.');
      } else {
        alert('An unexpected error occurred. Please try again.');
      }
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
    patientName, // Expose patient name state
    loading,
    availableTimes,
    handleSubmit,
  };
}