'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchDoctors, Doctor } from '../services/doctorService'; // Import Doctor type
import Image from 'next/image';

export default function DoctorSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]); // Use Doctor type
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 3) {
        setLoading(true);
        setError('');
        try {
          const doctors = await fetchDoctors(searchTerm.trim());
          setFilteredDoctors(doctors);
        } catch (err) {
          console.error('Error fetching doctors:', err);
          setError('Failed to fetch doctors. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        setFilteredDoctors([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

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
            setError('');
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
              onClick={() => router.push(`/dashboard/doctor/${doctor.id}`)}
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