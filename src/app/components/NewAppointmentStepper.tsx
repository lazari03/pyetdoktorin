import { useState } from 'react';
import DoctorSearch from '@/app/components/DoctorSearch';
import useNewAppointment from '@/hooks/useNewAppointment';
import { useRouter } from 'next/navigation';
import AppointmentConfirmation from './AppointmentConfirmation';

const steps = [
  'Select Doctor',
  'Choose Date & Time',
  'Add Notes & Confirm',
];

export default function NewAppointmentStepper() {
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
    handleSubmit,
    isSubmitting,
    availableTimes,
  } = useNewAppointment();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // Progress calculation
  const progressPercent = ((step + 1) / steps.length) * 100;

  // Step 1: Doctor selection
  const renderDoctorStep = () => (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
      <h2 className="font-bold text-xl mb-2">Find a Doctor</h2>
      <DoctorSearch
        onDoctorSelect={(doctor) => {
          setSelectedDoctor({
            ...doctor,
            specialization: Array.isArray(doctor.specialization)
              ? doctor.specialization.join(', ')
              : doctor.specialization || 'General',
          });
          setStep(1);
        }}
      />
    </div>
  );

  // Step 2: Date & Time
  const renderDateTimeStep = () => (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
      <h2 className="font-bold text-xl mb-2">Choose Date & Time</h2>
      <div>
        <label className="block text-sm font-medium mb-1">Appointment Type</label>
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
        <label className="block text-sm font-medium mb-1">Preferred Date</label>
        <input
          type="date"
          className="input input-bordered w-full"
          value={preferredDate}
          onChange={(e) => setPreferredDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Preferred Time</label>
        <select
          className="select select-bordered w-full"
          value={preferredTime}
          onChange={(e) => setPreferredTime(e.target.value)}
          required
        >
          <option value="" disabled>Select a time</option>
          {Array.isArray(availableTimes) &&
            availableTimes
              .filter((t: { time: string; disabled: boolean }) => !t.disabled)
              .map((t: { time: string }) => (
                <option key={t.time} value={t.time}>{t.time}</option>
              ))}
        </select>
      </div>
      <div className="flex justify-between mt-2">
        <button
          className="px-4 py-1.5 rounded-full border border-orange-500 text-orange-500 bg-white hover:bg-orange-50 transition font-semibold text-sm"
          onClick={() => setStep(0)}
        >
          Back
        </button>
        <button
          className="px-4 py-1.5 rounded-full bg-orange-500 text-white font-semibold shadow hover:bg-orange-600 transition text-sm"
          onClick={() => setStep(2)}
          disabled={!preferredDate || !preferredTime || !appointmentType}
        >
          Next
        </button>
      </div>
    </div>
  );

  // Step 3: Notes & Confirm
  const renderNotesStep = () => (
    <form
      className="flex flex-col gap-4 w-full max-w-sm mx-auto"
      onSubmit={async (e) => {
        e.preventDefault();
        await handleSubmit(e, setShowModal, () => {});
      }}
    >
      <h2 className="font-bold text-xl mb-2">Add Notes & Confirm</h2>
      <div>
        <label className="block text-sm font-medium mb-1">Notes (symptoms, concerns, etc.)</label>
        <textarea
          className="textarea textarea-bordered w-full"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Please describe your symptoms or reason for the appointment..."
        ></textarea>
      </div>
      <div className="flex justify-between mt-2">
        <button
          className="px-6 py-2 rounded-full border border-orange-500 text-orange-500 bg-white hover:bg-orange-50 transition font-semibold"
          type="button"
          onClick={() => setStep(1)}
        >
          Back
        </button>
        <button
          className="px-6 py-2 rounded-full bg-orange-500 text-white font-semibold shadow hover:bg-orange-600 transition"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Booking...' : 'Confirm'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="w-full max-w-3xl mx-auto mt-10">
      {/* Progress Bar */}
      <div className="w-full bg-gray-100 rounded-2xl h-3 mb-10 shadow-sm">
        <div
          className="bg-orange-500 h-3 rounded-2xl transition-all shadow-md"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
      <div className="flex gap-8">
        {/* Step Panels */}
        <div className="flex-1">
          <div className="bg-white rounded-3xl shadow-lg p-8 min-h-[350px] flex flex-col justify-center">
            {step === 0 && renderDoctorStep()}
            {step === 1 && renderDateTimeStep()}
            {step === 2 && renderNotesStep()}
          </div>
        </div>
        {/* Optionally, show summary or doctor info on the right for steps 1/2/3 */}
        {selectedDoctor && (
          <div className="flex-1 hidden md:block bg-white rounded-3xl shadow-lg p-8 ml-4 min-h-[350px] flex flex-col justify-center border border-gray-100">
            <h3 className="font-bold text-lg mb-4 text-gray-700">Selected Doctor</h3>
            <div className="mb-2 text-xl font-semibold text-orange-500">{selectedDoctor.name}</div>
            <div className="mb-4 text-sm text-gray-500">{selectedDoctor.specialization}</div>
            {preferredDate && <div className="mb-1 text-gray-600">Date: <span className="font-medium">{preferredDate}</span></div>}
            {preferredTime && <div className="mb-1 text-gray-600">Time: <span className="font-medium">{preferredTime}</span></div>}
            {appointmentType && <div className="mb-1 text-gray-600">Type: <span className="font-medium">{appointmentType}</span></div>}
          </div>
        )}
      </div>
      {/* Confirmation Modal */}
      {showModal && (
        <AppointmentConfirmation onClose={() => router.push('/dashboard/appointments')} />
      )}
    </div>
  );
}
