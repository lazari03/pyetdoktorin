'use client'

import { useState } from 'react'
import Image from 'next/image'
import AppointmentModal from './AppointmentModal'

interface DoctorProfileProps {
  id: string // The ID of the doctor to fetch
}

// Mock data - replace with actual API call
const getDoctorById = (id: string) => {
  // Simulate fetching doctor data by ID
  const doctors = [
    {
      id: '1',
      name: 'Dr. John Doe',
      expertise: 'Cardiologist',
      image: '/img/profile_placeholder.png',
      bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      specializations: ['Heart Surgery', 'Vascular Medicine'],
      education: ['MD from Harvard Medical School', 'Residency at Mayo Clinic'],
    },
    {
      id: '2',
      name: 'Dr. Jane Smith',
      expertise: 'Dermatologist',
      image: '/img/profile_placeholder.png',
      bio: 'Specialist in skin care and dermatology.',
      specializations: ['Skin Cancer', 'Acne Treatment'],
      education: ['MD from Stanford University', 'Residency at UCLA'],
    },
  ]

  return doctors.find((doctor) => doctor.id === id) || doctors[0] // Default to the first doctor if not found
}

export default function DoctorProfile({ id }: DoctorProfileProps) {
  const doctor = getDoctorById(id) // Explicitly using `id` here to fetch doctor data
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="w-full max-w-4xl mx-auto p-3 md:p-6">
      <div className="card bg-base-100 shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <figure className="w-full md:w-1/3 p-6 flex items-center justify-center">
            <div className="w-48 h-48 relative rounded-full overflow-hidden">
              <Image
                src={doctor.image}
                alt={doctor.name}
                fill
                className="object-cover"
                sizes="192px"
              />
            </div>
          </figure>
          <div className="card-body w-full md:w-2/3 p-6">
            <h2 className="card-title text-3xl">{doctor.name}</h2>
            <p className="text-xl text-primary">{doctor.expertise}</p>
            <div className="divider my-3"></div>
            <h3 className="text-xl font-semibold">About</h3>
            <p>{doctor.bio}</p>
            <div className="divider my-3"></div>
            <h3 className="text-xl font-semibold">Specializations</h3>
            <ul className="list-disc list-inside">
              {doctor.specializations.map((spec, index) => (
                <li key={index}>{spec}</li>
              ))}
            </ul>
            <div className="divider my-3"></div>
            <h3 className="text-xl font-semibold">Education</h3>
            <ul className="list-disc list-inside">
              {doctor.education.map((edu, index) => (
                <li key={index}>{edu}</li>
              ))}
            </ul>
            <div className="card-actions justify-end mt-6">
              <button
                className="btn btn-primary"
                onClick={() => setIsModalOpen(true)}
              >
                Request Appointment
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <AppointmentModal
          doctor={{ ...doctor, id: parseInt(doctor.id, 10) }}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}