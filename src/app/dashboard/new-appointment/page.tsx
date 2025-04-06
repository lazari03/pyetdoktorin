'use client';

import { useNewAppointmentStore } from '@/store/newAppointmentStore';
import DoctorSearch from '@/app/components/DoctorSearch';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../config/firebaseconfig';
import { useContext, useState } from 'react';
import { AuthContext } from '../../../context/AuthContext'; // Import your AuthContext
import { useRouter } from 'next/navigation'; // For redirection

// Define the type for an appointment
interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  appointmentType: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
  isPaid: boolean;
  createdAt: string;
}

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

  const { user } = useContext(AuthContext); // Use context to get the authenticated user
  const router = useRouter(); // For navigation
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [progress, setProgress] = useState(100); // Progress bar state
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent multiple submissions

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || isSubmitting) {
      console.error('User is not authenticated or submission is already in progress');
      return;
    }

    setIsSubmitting(true); // Disable further submissions

    const appointmentData: Omit<Appointment, 'id'> = {
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      patientId: user.uid, // Include the authenticated user's UID
      appointmentType,
      preferredDate,
      preferredTime,
      notes,
      isPaid: false, // Default to unpaid
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, 'appointments'), appointmentData);
      console.log('Appointment successfully saved:', appointmentData);
      resetAppointment();
      setShowModal(true); // Show the confirmation modal

      // Start progress bar countdown
      let progressValue = 100;
      const interval = setInterval(() => {
        progressValue -= 10;
        setProgress(progressValue);
        if (progressValue <= 0) {
          clearInterval(interval);
        }
      }, 300); // Update every 300ms (3 seconds total)
    } catch (error) {
      console.error('Error saving appointment:', error);
      setIsSubmitting(false); // Re-enable submission in case of error
    }
  };

  const handlePayNow = (appointmentId: string) => {
    console.log(`Pay Now clicked for appointment ID: ${appointmentId}`);
    // Add payment logic here
  };

  const handleJoinCall = (appointmentId: string) => {
    console.log(`Join Call clicked for appointment ID: ${appointmentId}`);
    // Add join call logic here
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
