'use client';

import DoctorSearch from '@/app/components/DoctorSearch';
import { useState } from 'react'; 
import { useRouter } from 'next/navigation';
import useNewAppointment from '@/hooks/useNewAppointment'; // Custom hook for appointment logic

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
    handleSubmit,
    isSubmitting,
  } = useNewAppointment(); // Use the custom hook

  const router = useRouter(); // For navigation
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [progress, setProgress] = useState(100); // Progress bar state

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">New Appointment</h2>
        {!selectedDoctor && (
          <div className="mt-6">
            <h3 className="font-bold text-lg">Search and Select a Doctor</h3>
            <DoctorSearch
              onDoctorSelect={(doctor) =>
                setSelectedDoctor({
                  ...doctor,
                  specialization: Array.isArray(doctor.specialization) 
                    ? doctor.specialization.join(', ') 
                    : doctor.specialization || "General", // Provide a default specialization if missing
                })
              }
            />
          </div>
        )}

        {selectedDoctor && (
          <div className="mt-6">
            <h3 className="font-bold text-lg">Book Appointment with {selectedDoctor.name}</h3>
            <form className="form-control gap-4 mt-4" onSubmit={(e) => handleSubmit(e, setShowModal, setProgress)}>
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
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting} // Disable button during submission
                >
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

      {/* Confirmation Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box text-center">
            <div className="flex justify-center mb-4 text-green-500 text-6xl">✅</div>
            <h3 className="font-bold text-lg">Appointment Request Sent</h3>
            <p className="py-4">Your appointment request has been successfully sent!</p>
            <div className="progress w-full bg-gray-200 mb-4">
              <div
                className="progress-bar bg-green-500"
                style={{ width: `${progress}%`, transition: 'width 0.3s' }}
              ></div>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => router.push('/dashboard/appointments')} // Redirect on button click
            >
              Go to Appointments
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
