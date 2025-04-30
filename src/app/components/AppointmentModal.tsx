'use client';

import { useEffect } from 'react';
import useNewAppointment from '../../hooks/useNewAppointment';

export default function AppointmentModal({
  isOpen,
  onClose,
  doctor,
}: {
  isOpen: boolean;
  onClose: () => void;
  doctor: { id: string; name: string; specialization?: string };
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
    availableTimes,
    handleSubmit,
  } = useNewAppointment();

  useEffect(() => {
    if (isOpen) {
      setSelectedDoctor({
        ...doctor,
        specialization: doctor.specialization || "General", // Provide a default specialization if missing
      });
    }
  }, [isOpen, doctor, setSelectedDoctor]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">New Appointment</h2>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e, onClose, () => {}); // Pass the required arguments
          }}
        >
          <div>
            <label className="block text-sm font-medium mb-1">Doctor Name</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={doctor.name}
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Appointment Type</label>
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
            <label className="block text-sm font-medium mb-1">Preferred Date</label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Preferred Time</label>
            <select
              className="select select-bordered w-full"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
            >
              <option value="" disabled>
                Select a time
              </option>
              {availableTimes?.map(({ time, disabled }) => (
                <option key={time} value={time} disabled={disabled}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
