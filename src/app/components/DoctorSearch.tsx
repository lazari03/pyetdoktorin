'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// Mock data - replace with actual API call
const doctors = [
  {
    id: 1,
    name: 'Dr. John Smith',
    expertise: 'Cardiologist',
    image: '/img/profile_placeholder.png',
  },
  {
    id: 2,
    name: 'Dr. Sarah Williams',
    expertise: 'Neurologist',
    image: '/img/profile_placeholder.png',
  },
  {
    id: 3,
    name: 'Dr. Michael Chen',
    expertise: 'Pediatrician',
    image: '/img/profile_placeholder.png',
  },
  {
    id: 4,
    name: 'Dr. Emily Brown',
    expertise: 'Dermatologist',
    image: '/img/profile_placeholder.png',
  },
  {
    id: 5,
    name: 'Dr. James Wilson',
    expertise: 'Orthopedic Surgeon',
    image: '/img/profile_placeholder.png',
  },
  {
    id: 6,
    name: 'Dr. Maria Garcia',
    expertise: 'Psychiatrist',
    image: '/img/profile_placeholder.png',
  },
  {
    id: 7,
    name: 'Dr. David Lee',
    expertise: 'Ophthalmologist',
    image: '/img/profile_placeholder.png',
  },
  {
    id: 8,
    name: 'Dr. Lisa Anderson',
    expertise: 'Endocrinologist',
    image: '/img/profile_placeholder.png',
  },
  {
    id: 9,
    name: 'Dr. Robert Taylor',
    expertise: 'Gastroenterologist',
    image: '/img/profile_placeholder.png',
  },
  {
    id: 10,
    name: 'Dr. Jennifer Martinez',
    expertise: 'Family Medicine',
    image: '/img/profile_placeholder.png',
  },
]

export default function DoctorSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  const filteredDoctors = searchTerm.length >= 3 
    ? doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.expertise.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Type at least 3 characters to search doctors..."
          className="input input-bordered w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {searchTerm.length >= 3 && (
        <div className="grid gap-4">
          {filteredDoctors.length === 0 ? (
            <p className="text-center text-gray-500">
              No doctors found matching your search
            </p>
          ) : (
            filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="card card-side bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
                onClick={() => router.push(`/dashboard/doctor/${doctor.id}`)}
              >
                <figure className="p-4">
                  <div className="w-[100px] h-[100px] relative rounded-full overflow-hidden">
                    <Image
                      src={doctor.image}
                      alt={doctor.name}
                      width={100}
                      height={100}
                      className="object-cover"
                    />
                  </div>
                </figure>
                <div className="card-body">
                  <h2 className="card-title">{doctor.name}</h2>
                  <p>{doctor.expertise}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
