'use client';

import { useState } from 'react';

interface AppointmentModalProps {
  doctor: { id: number; name: string; expertise: string };
  onClose: () => void;
}

export default function AppointmentModal({ doctor, onClose }: AppointmentModalProps) {
  const [appointmentType, setAppointmentType] = useState('Check-up');
  const [preferredDate, setPreferredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send appointment details to the backend
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: doctor.id,
          doctorName: doctor.name,
          appointmentType,
          preferredDate,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to book the appointment');
      }

      // Redirect to the "Appointment History" or "Upcoming Appointments" page
      window.location.href = '/appointments/upcoming'; // Adjust the URL as needed
    } catch (error) {
      console.error('Error booking the appointment:', error);
      alert('Failed to book the appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Book Appointment</h2>
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
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Notes</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={4}
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