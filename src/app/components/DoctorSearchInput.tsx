'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchDoctors, Doctor } from '../../services/doctorService';
import { useRouter } from 'next/navigation';

interface DoctorSearchInputProps {
  searchType: 'name' | 'expertise';
}

export default function DoctorSearchInput({ searchType }: DoctorSearchInputProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length >= 4) {
        fetchDoctorsList(searchTerm);
      } else {
        setFilteredDoctors([]);
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchDoctorsList = async (term: string) => {
    setLoading(true);
    setError('');
    setFilteredDoctors([]);

    try {
      const doctors = await fetchDoctors(term, searchType);
      setFilteredDoctors(doctors);
    } catch (err) {
      setError('Failed to fetch doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorClick = (doctor: Doctor) => {
    router.push(`/dashboard/doctor/${doctor.id}`);
  };

  const handleSearchFocus = () => {
    setIsOverlayVisible(true);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setIsOverlayVisible(false);
    }
  };

  useEffect(() => {
    if (isOverlayVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOverlayVisible]);

  return (
    <>
      {isOverlayVisible && (
        <div className="fixed inset-0 bg-orange-500 bg-opacity-90 z-40"></div>
      )}
      <div ref={searchRef} className="relative z-50 flex flex-col items-center mx-auto max-w-md">
        <div className="relative flex items-center bg-white rounded-full shadow-md p-1 w-full">
          <input
            type="text"
            placeholder={`Search by ${searchType}...`}
            className="flex-grow rounded-full px-4 py-2 text-sm focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleSearchFocus}
          />
          <button
            onClick={() => fetchDoctorsList(searchTerm)}
            className="ml-2 bg-orange-500 text-white px-4 py-2 rounded-full text-sm hover:bg-orange-600 transition-colors"
          >
            Search
          </button>
        </div>

        {isOverlayVisible && (
          <div className="relative w-full mt-2">
            {loading && <p className="text-center text-gray-500 text-sm">Loading...</p>}
            {error && <p className="text-center text-red-500 text-sm">{error}</p>}
            {filteredDoctors.length > 0 && (
              <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-sm max-h-48 overflow-auto">
                {filteredDoctors.map((doctor) => (
                  <li
                    key={doctor.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleDoctorClick(doctor)}
                  >
                    <div className="font-medium text-sm">{doctor.name}</div>
                    <div className="text-xs text-gray-500">
                      {doctor.expertise?.join(', ') || 'No expertise'}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {!loading && searchTerm.length >= 4 && filteredDoctors.length === 0 && (
              <p className="text-center text-gray-500 text-sm">No doctors found.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}