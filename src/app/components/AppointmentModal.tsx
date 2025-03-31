'use client';

import { useState, useEffect } from 'react';
import { db } from '../../../config/firebaseconfig';
import { collection, addDoc } from 'firebase/firestore';
import { auth } from '../../../config/firebaseconfig';
import { addMinutes, format, isSameDay, isBefore, startOfDay } from 'date-fns';
import { fetchDoctorId } from '../hooks/useAppointments'; // Import standalone fetchDoctorId function

interface AppointmentModalProps {
  doctor: { id: string; name: string; expertise: string };
  onClose: () => void;
}

export default function AppointmentModal({ doctor, onClose }: AppointmentModalProps) {
  const [appointmentType, setAppointmentType] = useState('Check-up');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [notes, setNotes] = useState('');
  const [availableTimes, setAvailableTimes] = useState<{ time: string; disabled: boolean }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (preferredDate) {
      const now = new Date();
      const selectedDate = startOfDay(new Date(preferredDate));
      const times: { time: string; disabled: boolean }[] = [];

      for (let minutes = 0; minutes < 24 * 60; minutes += 30) {
        const time = addMinutes(selectedDate, minutes);
        const formattedTime = format(time, 'hh:mm a');

        // Disable times in the past for the current day
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
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated. Please log in.');
      }

      if (!doctor || typeof doctor.id !== 'string' || typeof doctor.name !== 'string') {
        throw new Error('Doctor information is missing or incomplete. Please ensure the doctor is selected.');
      }

      const appointmentId = `${user.uid}_${doctor.id}_${Date.now()}`;
      const appointmentData = {
        patientId: user.uid,
        doctorId: doctor.id,
        doctorName: doctor.name,
        appointmentType,
        preferredDate,
        preferredTime,
        notes,
        status: 'pending', // Initial status
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'appointments'), appointmentData);

      alert('Appointment booked successfully!');
      onClose();
    } catch (error) {
      console.error('Error booking the appointment:', error);
      alert(error instanceof Error ? error.message : 'Failed to book the appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4 text-center">Book Appointment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Doctor</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={`${doctor.name} (${doctor.expertise})`}
              disabled
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Appointment Type</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={appointmentType}
              onChange={(e) => setAppointmentType(e.target.value)}
            >
              <option>Check-up</option>
              <option>Follow-up</option>
              <option>Consultation</option>
            </select>
          </div>

          <div>
            <label className="label">
              <span className="label-text">Preferred Date</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]} // Only allow current or future dates
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Preferred Time</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              required
            >
              <option value="" disabled>
                Select a time
              </option>
              {availableTimes.map(({ time, disabled }) => (
                <option key={time} value={time} disabled={disabled}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">
              <span className="label-text">Notes</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

          <div className="flex justify-between space-x-2">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              Book Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
