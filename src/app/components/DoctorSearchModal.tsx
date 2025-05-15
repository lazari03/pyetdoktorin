'use client';

import { useState, useEffect } from 'react';
import { fetchDoctors } from '../../services/doctorService';
import { Doctor } from '../../models/Doctor';
import { useRouter } from 'next/navigation';
import { SearchType } from '../../models/FirestoreConstants';

interface DoctorSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: DOMRect | null;
}

export default function DoctorSearchModal({ isOpen, onClose, position }: DoctorSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim().length >= 4) {
        fetchDoctorsList(searchTerm.trim());
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
      const doctorsByName = await fetchDoctors(term, SearchType.Name);
      const doctorsBySpecializations = await fetchDoctors(term, SearchType.Specializations); // Corrected to use specializations
      const uniqueDoctors = Array.from(
        new Map([...doctorsByName, ...doctorsBySpecializations].map((doc) => [doc.id, doc])).values()
      );
      setFilteredDoctors(uniqueDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to fetch doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorClick = (doctor: Doctor) => {
    router.push(`/dashboard/doctor/${doctor.id}`);
    onClose(); // Close modal after navigation
  };

  if (!isOpen || !position) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-500 ease-in-out"></div>
      <div
        className="fixed z-50 bg-white rounded-lg shadow-lg p-6"
        style={{
          top: position.top,
          left: position.left,
          width: position.width,
          transform: 'translateY(0)',
          transition: 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">Search for Doctors</h2>
        <div className="relative flex items-center bg-gray-100 rounded-full p-2">
          <input
            type="text"
            placeholder="Search by name or specializations..."
            className="flex-grow bg-transparent px-4 py-2 text-sm focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="mt-4">
          {loading && <p className="text-center text-gray-500 text-sm">Loading...</p>}
          {error && <p className="text-center text-red-500 text-sm">{error}</p>}
          {filteredDoctors.length > 0 && (
            <ul className="mt-2 bg-white border border-gray-200 rounded-md shadow-sm max-h-48 overflow-auto">
              {filteredDoctors.map((doctor) => (
                <li
                  key={doctor.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleDoctorClick(doctor)}
                >
                  <div className="font-medium text-sm">{doctor.name}</div>
                  <div className="text-xs text-gray-500">
                    {doctor.specialization?.length
                      ? doctor.specialization.join(', ')
                      : 'No specializations available'}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {!loading && searchTerm.trim().length >= 4 && filteredDoctors.length === 0 && (
            <p className="text-center text-gray-500 text-sm">No doctors found.</p>
          )}
        </div>
      </div>
    </>
  );
}
