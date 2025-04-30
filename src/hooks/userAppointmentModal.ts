import { useState } from 'react';
import { db } from '../config/firebaseconfig'; // Import Firestore instance
import { collection, addDoc } from 'firebase/firestore';
import { auth } from '../config/firebaseconfig'; // Import Firebase auth

interface UseAppointmentModalProps {
  doctor: { id: number; name: string; expertise: string };
  onClose: () => void;
}

export const useAppointmentModal = ({ doctor, onClose }: UseAppointmentModalProps) => {
  const [appointmentType, setAppointmentType] = useState('Check-up');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser; // Get the currently logged-in user
      if (!user) {
        throw new Error('User not authenticated. Please log in.');
      }

      // Save appointment to Firestore
      const appointmentData = {
        doctorId: doctor.id,
        doctorName: doctor.name,
        appointmentType,
        preferredDate,
        preferredTime,
        notes,
        patientId: user.uid, // Add the logged-in user's ID
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'appointments'), appointmentData);

      alert('Appointment booked successfully!');
      onClose(); // Close the modal
    } catch (error) {
      console.error('Error booking the appointment:', error);
      alert('Failed to book the appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    appointmentType,
    setAppointmentType,
    preferredDate,
    setPreferredDate,
    preferredTime,
    setPreferredTime,
    notes,
    setNotes,
    loading,
    handleSubmit,
  };
};