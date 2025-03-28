'use client';

import { useState } from 'react';
import { db } from '../../../../config/firebaseconfig';
import { doc, setDoc } from 'firebase/firestore';
import DoctorSearchInput from '@/app/components/DoctorSearchInput';
import { isAuthenticated } from '../../services/authService';

export default function NewAppointmentPage() {
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [appointmentType, setAppointmentType] = useState<string>('Check-up');
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let userId: string | null = null;
    let error: string | null = null;

    isAuthenticated((authState) => {
      userId = authState.userId;
      error = authState.error;
    });
    if (error) {
      alert(error);
      return;
    }
    if (!selectedDoctorId) {
      alert('Please select a doctor.');
      return;
    }

    setLoading(true);
    try {
      const appointmentId = `${userId}_${selectedDoctorId}_${Date.now()}`;
      await setDoc(doc(db, 'appointments', appointmentId), {
        patientId: userId,
        doctorId: selectedDoctorId,
        appointmentType,
        preferredDate,
        notes,
        status: 'pending', // Initial status
        createdAt: new Date().toISOString(),
      });
      alert('Appointment scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      alert('Failed to schedule appointment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">New Appointment</h2>
        <form className="form-control gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="label">
              <span className="label-text">Select Doctor</span>
            </label>
            <DoctorSearchInput onSelect={(doctorId) => setSelectedDoctorId(Number(doctorId))} />
          </div>

          {selectedDoctorId && (
            <>
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
            </>
          )}

          <button
            type="submit"
            className={`btn btn-primary ${loading ? 'loading' : ''}`}
            disabled={!selectedDoctorId || loading}
          >
            Schedule Appointment
          </button>
        </form>
      </div>
    </div>
  );
}
