'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchDoctors } from '../services/doctorService';
import Image from 'next/image';

interface Doctor {
  id: string;
  name: string;
  surname?: string;
  specializations?: string[];
  image?: string;
}

export default function DoctorSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length >= 3) {
        fetchDoctorsData(searchTerm);
      } else {
        setFilteredDoctors([]); // Clear results if search term is too short
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchDoctorsData = async (term: string) => {
    setLoading(true);
    setError('');
    try {
      const doctors = await fetchDoctors(term.trim());
      setFilteredDoctors(doctors);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to fetch doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorClick = (firebaseId: string) => {
    router.push(`/dashboard/doctor/${firebaseId}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Type at least 3 characters to search doctors..."
          className="input input-bordered w-full"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setError(''); // Clear error when user starts typing
          }}
        />
      </div>

      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {filteredDoctors.length > 0 && (
        <div className="grid gap-4">
          {filteredDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="card card-side bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
              onClick={() => handleDoctorClick(doctor.id)}
            >
              <figure className="p-4">
                <Image
                  src={doctor.image || '/img/profile_placeholder.png'}
                  alt={`${doctor.name} ${doctor.surname || ''}`}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              </figure>
              <div className="card-body">
                <h2 className="card-title">{doctor.name} {doctor.surname}</h2>
                <p>{doctor.specializations?.join(', ') || 'No specializations listed'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && searchTerm.length >= 3 && filteredDoctors.length === 0 && (
        <p className="text-center text-gray-500">No doctors found matching your search.</p>
      )}
    </div>
  );
}