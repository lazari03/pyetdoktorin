'use client';

import DoctorSearchInput from '../../components/DoctorSearchInput';
import useNewAppointment from '../../hooks/useNewAppointment';

export default function NewAppointmentPage() {
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
    loading,
    availableTimes,
    handleSubmit,
  } = useNewAppointment();

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">New Appointment</h2>
        <div>
          <label className="label">
            <span className="label-text">Select Doctor</span>
          </label>
          <DoctorSearchInput
            onSelect={(doctor) => {
              setSelectedDoctor(doctor);
            }}
          />
        </div>

        {selectedDoctor && (
          <div className="mt-6">
            <h3 className="font-bold text-lg">Book Appointment with {selectedDoctor.name}</h3>
            <form className="form-control gap-4 mt-4" onSubmit={handleSubmit}>
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
                <button
                  type="button"
                  className="btn"
                  onClick={() => setSelectedDoctor(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
