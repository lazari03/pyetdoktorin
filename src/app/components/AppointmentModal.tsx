'use client';

import { useEffect } from 'react';
import useNewAppointment from '../hooks/useNewAppointment';

export default function AppointmentModal({
  isOpen,
  onClose,
  doctor,
}: {
  isOpen: boolean;
  onClose: () => void;
  doctor: { id: string; name: string };
}) {
  const {
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
  } = useNewAppointment();

  // Pre-select the doctor when the modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDoctor(doctor);
    }
  }, [isOpen, doctor, setSelectedDoctor]);

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h2 className="font-bold text-lg">New Appointment</h2>
        <form className="form-control gap-4 mt-4" onSubmit={handleSubmit}>
          <div>
            <label className="label">
              <span className="label-text">Doctor Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={doctor.name}
              disabled // Disable the field as the doctor is pre-selected
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
              min={new Date().toISOString().split('T')[0]}
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
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              Confirm Booking
            </button>
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
