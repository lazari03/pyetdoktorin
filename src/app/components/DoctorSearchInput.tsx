'use client'

import { useState } from 'react'
import { doctors } from '@/app/data/doctors' // You'll need to move the doctors array to a separate file

interface DoctorSearchInputProps {
  onSelect: (doctorId: number) => void
}

export default function DoctorSearchInput({ onSelect }: DoctorSearchInputProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const filteredDoctors = searchTerm.length >= 2 
    ? doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.expertise.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search for a doctor..."
        className="input input-bordered w-full"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          setIsSearching(true)
        }}
        onFocus={() => setIsSearching(true)}
      />
      
      {isSearching && searchTerm.length >= 2 && (
        <div className="absolute z-10 w-full mt-1 bg-base-100 shadow-xl rounded-box max-h-64 overflow-auto">
          {filteredDoctors.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No doctors found</div>
          ) : (
            <ul>
              {filteredDoctors.map(doctor => (
                <li 
                  key={doctor.id}
                  className="p-2 hover:bg-base-200 cursor-pointer"
                  onClick={() => {
                    onSelect(doctor.id)
                    setSearchTerm(doctor.name)
                    setIsSearching(false)
                  }}
                >
                  <div className="font-medium">{doctor.name}</div>
                  <div className="text-sm text-gray-500">{doctor.expertise}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
