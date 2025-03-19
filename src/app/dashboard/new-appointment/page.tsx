'use client'

import { useState } from 'react'
import DoctorSearchInput from '@/app/components/DoctorSearchInput'

export default function NewAppointmentPage() {
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">New Appointment</h2>
        <form className="form-control gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="label">
              <span className="label-text">Select Doctor</span>
            </label>
            <DoctorSearchInput onSelect={setSelectedDoctorId} />
          </div>

          {selectedDoctorId && (
            <>
              <div>
                <label className="label">
                  <span className="label-text">Appointment Type</span>
                </label>
                <select className="select select-bordered w-full">
                  <option>Check-up</option>
                  <option>Follow-up</option>
                  <option>Consultation</option>
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Preferred Date</span>
                </label>
                <input type="date" className="input input-bordered w-full" />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Notes</span>
                </label>
                <textarea className="textarea textarea-bordered w-full" rows={4}></textarea>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!selectedDoctorId}
          >
            Schedule Appointment
          </button>
        </form>
      </div>
    </div>
  )
}
