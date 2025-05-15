'use client';

import { useDoctorSearchStore } from '../../store/doctorSearchStore';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Doctor } from '@/models/Doctor';
import { useEffect } from 'react';

interface DoctorSearchProps {
  onDoctorSelect?: (doctor: Doctor) => void;
}

export default function DoctorSearch({ onDoctorSelect }: DoctorSearchProps) {
  const {
    searchTerm,
    setSearchTerm,
    filteredDoctors,
    loading,
    error,
    fetchDoctors,
    reset,
    clearResults,
  } = useDoctorSearchStore();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // Reset search state when component mounts
  useEffect(() => {
    reset();
  }, [reset]);

  const handleDoctorClick = (doctor: Doctor) => {
    // Format the specialization for display
    const formattedDoctor = {
      ...doctor,
      specialization: Array.isArray(doctor.specialization) 
        ? doctor.specialization 
        : doctor.specialization ? [doctor.specialization] : []
    };
    
    if (onDoctorSelect) {
      onDoctorSelect(formattedDoctor);
      setSearchTerm(''); // Clear search after selection
      clearResults(); // Also clear the results
    } else {
      router.push(`/dashboard/doctor/${doctor.id}`);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    clearResults(); // Clear results when clearing the search
  };

  if (authLoading) {
    return <p className="text-center">Loading authentication...</p>;
  }

  if (!isAuthenticated) {
    return <p className="text-center text-red-500">You must be logged in to search for doctors.</p>;
  }

  return (
    <div className="relative">
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search doctors by name or specializations..."
            className="input input-bordered w-full pr-10"
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value;
              setSearchTerm(value);
              
              if (value.trim() === '') {
                clearResults(); // Clear results if search is empty
              } else if (value.trim().length >= 4) {
                fetchDoctors();
              }
            }}
          />
          {searchTerm && (
            <button 
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
              onClick={handleClearSearch}
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Start typing at least 4 characters to search
        </p>
      </div>

      {loading && <p className="text-center py-2">Loading results...</p>}
      {error && <p className="text-red-500 text-center py-2">{error}</p>}

      {filteredDoctors.length > 0 && (
        <ul className="absolute z-10 w-full bg-base-100 shadow-lg rounded-lg overflow-hidden max-h-64 overflow-y-auto">
          {filteredDoctors.map((doctor) => (
            <li
              key={doctor.id}
              className="p-4 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-none"
              onClick={() => handleDoctorClick(doctor)}
            >
              <div className="font-bold">{doctor.name}</div>
              <div className="text-sm text-gray-500">
                {Array.isArray(doctor.specialization) && doctor.specialization.length > 0
                  ? doctor.specialization.join(', ')
                  : 'General Practice'}
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && searchTerm.trim().length >= 4 && filteredDoctors.length === 0 && (
        <div className="absolute z-10 w-full bg-base-100 shadow-lg rounded-lg p-4 text-center text-gray-500">
          No doctors found with that name or specialization.
        </div>
      )}
    </div>
  );
}