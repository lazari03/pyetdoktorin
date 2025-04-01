'use client';

import { useState, useEffect } from 'react';
import { fetchDoctors, Doctor } from '../services/doctorService';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext'; // Import AuthContext

interface DoctorSearchProps {
  onDoctorSelect?: (doctor: Doctor) => void;
}

export default function DoctorSearch({ onDoctorSelect }: DoctorSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth(); // Use AuthContext
  const router = useRouter();

  const closeSearch = () => {
    setIsOverlayVisible(false);
    setTimeout(() => {
      setSearchTerm('');
      setFilteredDoctors([]);
    }, 300);
  };

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      setError('You must be logged in to search for doctors.');
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length >= 4) {
        setLoading(true);
        setError('');
        setIsOverlayVisible(true);
        try {
          const doctors = await fetchDoctors(searchTerm.trim(), 'name'); // Default to name search
          setFilteredDoctors(doctors);
        } catch (err) {
          console.error('Error fetching doctors:', err);
          setError('Failed to fetch doctors. Please try again.');
        } finally {
          setLoading(false);
        }
      } else if (searchTerm.trim().length === 0) {
        setIsOverlayVisible(false);
        setFilteredDoctors([]);
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, isAuthenticated, authLoading]);

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
          className="fixed inset-0 bg-black bg-opacity-90 z-40 transition-opacity duration-300"
          onClick={closeSearch}
        ></div>
      )}

      <div className="relative z-50">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search doctors by name or specializations..."
            className="input input-bordered w-full"
            value={searchTerm}
            onFocus={() => setIsOverlayVisible(true)}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {filteredDoctors.length > 0 && (
          <ul className="absolute z-50 w-full bg-base-100 shadow-lg rounded-lg overflow-hidden">
            {filteredDoctors.map((doctor, index) => (
              <li
                key={`${doctor.id}-${index}`}
                className="p-4 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  if (onDoctorSelect) {
                    onDoctorSelect(doctor);
                  } else {
                    router.push(`/dashboard/doctor/${doctor.id}`);
                  }
                  closeSearch();
                }}
              >
                <div className="font-bold">{doctor.name}</div>
                <div className="text-sm text-gray-500">
                  {doctor.specializations?.join(', ') || 'No specializations'}
                </div>
              </li>
            ))}
          </ul>
        )}

        {!loading && searchTerm.length >= 4 && filteredDoctors.length === 0 && (
          <p className="text-center text-gray-500">No doctors found.</p>
        )}
      </div>
    </>
  );
}