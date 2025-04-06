'use client';

import { useNewAppointmentStore } from '@/store/newAppointmentStore';
import DoctorSearch from '@/app/components/DoctorSearch';

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
    resetAppointment,
  } = useNewAppointmentStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting appointment:', {
      selectedDoctor,
      appointmentType,
      preferredDate,
      preferredTime,
      notes,
    });
    resetAppointment();
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">New Appointment</h2>
        {!selectedDoctor && (
          <div className="mt-6">
            <h3 className="font-bold text-lg">Search and Select a Doctor</h3>
            <DoctorSearch onDoctorSelect={(doctor) => setSelectedDoctor(doctor)} />
          </div>
        )}

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
                <input
                  type="time"
                  className="input input-bordered w-full"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
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

              <div className="flex gap-4">
                <button type="submit" className="btn btn-primary">
                  Confirm Booking
                </button>
                <button type="button" className="btn" onClick={resetAppointment}>
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
