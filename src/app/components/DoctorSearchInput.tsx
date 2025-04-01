'use client';

import { useState, useEffect } from 'react';
import { fetchDoctors, Doctor } from '../services/doctorService';
import { useRouter } from 'next/navigation';

interface DoctorSearchInputProps {
  searchType: 'name' | 'specializations'; // Update type
}

export default function DoctorSearchInput({ searchType }: DoctorSearchInputProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length >= 4) { // Trigger search after 4 characters
        fetchDoctorsList(searchTerm);
      } else {
        setFilteredDoctors([]);
      }
    }, 1000); // 1-second delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchDoctorsList = async (term: string) => {
    setLoading(true);
    setError('');
    setFilteredDoctors([]);

    try {
      const doctors = await fetchDoctors(term); // Remove the second argument
      setFilteredDoctors(doctors);
    } catch (err) {
      setError('Failed to fetch doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorClick = (doctor: Doctor) => {
    router.push(`/dashboard/doctor/${doctor.id}`); // Navigate to the doctor's profile
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={`Search doctors by ${searchType}...`}
        className="input input-bordered w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading && <p className="text-center text-gray-500 mt-2">Loading...</p>}
      {error && <p className="text-center text-red-500 mt-2">{error}</p>}

      {filteredDoctors.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-base-100 shadow-xl rounded-box max-h-64 overflow-auto">
          {filteredDoctors.map((doctor) => (
            <li
              key={doctor.id}
              className="p-2 hover:bg-base-200 cursor-pointer"
              onClick={() => handleDoctorClick(doctor)}
            >
              <div className="font-medium">{doctor.name}</div>
              <div className="text-sm text-gray-500">
                {doctor.specializations?.join(', ') || 'No specializations'} {/* Display specializations */}
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && searchTerm.length >= 2 && filteredDoctors.length === 0 && (
        <p className="text-center text-gray-500 mt-2">No doctors found.</p>
      )}
    </div>
  );
}