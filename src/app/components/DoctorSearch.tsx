'use client';

import { useDoctorSearchStore } from '../../store/doctorSearchStore';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Doctor } from '@/models/Doctor';

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
    isOverlayVisible,
    toggleOverlay,
    fetchDoctors,
  } = useDoctorSearchStore();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const handleDoctorClick = (doctor: Doctor) => {
    if (onDoctorSelect) {
      onDoctorSelect(doctor);
    } else {
      router.push(`/dashboard/doctor/${doctor.id}`);
    }
    toggleOverlay(false);
  };

  if (authLoading) {
    return <p className="text-center">Loading authentication...</p>;
  }

  if (!isAuthenticated) {
    return <p className="text-center text-red-500">You must be logged in to search for doctors.</p>;
  }

  return (
    <>
      {isOverlayVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 transition-opacity duration-300"
          onClick={() => toggleOverlay(false)}
        ></div>
      )}

      <div className="relative">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search doctors by name or specializations..."
            className="input input-bordered w-full"
            value={searchTerm}
            onFocus={() => {
              if (searchTerm.trim().length >= 1) {
                toggleOverlay(true);
              }
            }}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {filteredDoctors.length > 0 && (
          <ul className="absolute z-50 w-full bg-base-100 shadow-lg rounded-lg overflow-hidden">
            {filteredDoctors.map((doctor) => (
              <li
                key={doctor.id}
                className="p-4 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleDoctorClick(doctor)}
              >
                <div className="font-bold">{doctor.name}</div>
                <div className="text-sm text-gray-500">
                  {doctor.specialization?.length
                    ? doctor.specialization.join(', ')
                    : 'No specializations available'}
                </div>
              </li>
            ))}
          </ul>
        )}

        {!loading && searchTerm.trim().length >= 4 && filteredDoctors.length === 0 && (
          <p className="text-center text-gray-500">No doctors found.</p>
        )}
      </div>
    </>
  );
}