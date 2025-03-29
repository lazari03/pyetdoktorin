'use client';

import { useAppointmentModal } from '../hooks/userAppointmentModal';

interface AppointmentModalProps {
  doctor: { id: number; name: string; expertise: string };
  onClose: () => void;
}

export default function AppointmentModal({ doctor, onClose }: AppointmentModalProps) {
  const {
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
  } = useAppointmentModal({ doctor, onClose });

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      style={{
        padding: '1rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        overflowY: 'auto', 
        WebkitOverflowScrolling: 'touch', 
      }}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-md flex flex-col"
        style={{
          maxHeight: '90vh', 
          height: 'auto',
          boxSizing: 'border-box', 
        }}
      >
        <div className="p-6 overflow-y-auto flex-grow">
          <h2 className="text-lg font-semibold mb-4 text-center">Book Appointment</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
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
                required
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Preferred Time</span>
              </label>
              <input
                type="time"
                className="input input-bordered w-full"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                required
              />
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
            <div className="flex justify-between space-x-2 mt-4">
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
    </div>
  );
}
