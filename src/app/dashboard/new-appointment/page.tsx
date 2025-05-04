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
            <h3 className="font-bold text-lg mb-3">Find a Doctor</h3>
            <p className="text-gray-600 mb-4">
              Search for a doctor by name or specialization to schedule your appointment.
            </p>
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
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-xl">Book Appointment with Dr. {selectedDoctor.name}</h3>
                <p className="text-gray-600">
                  Specialization: {selectedDoctor.specialization || "General Practice"}
                </p>
              </div>
              <button 
                onClick={resetAppointment}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Change doctor
              </button>
            </div>
            
            <form className="form-control gap-4 mt-4" onSubmit={(e) => handleSubmit(e, setShowModal, setProgress)}>
              <div>
                <label className="label">
                  <span className="label-text">Appointment Type</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                  required
                >
                  <option value="">Select appointment type</option>
                  <option value="Check-up">Check-up</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Consultation">Consultation</option>
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
                  <span className="label-text">Notes (symptoms, concerns, etc.)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Please describe your symptoms or reason for the appointment..."
                ></textarea>
              </div>

              <div className="flex gap-4 mt-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting} // Disable button during submission
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Booking'}
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
