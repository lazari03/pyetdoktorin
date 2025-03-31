'use client';

import { useState, useEffect } from 'react';
import { fetchDoctors, Doctor } from '@/app/services/doctorService'; // Import Doctor type
import { useRouter } from 'next/navigation';

export default function DoctorSearchWidget({ onDoctorSelect }: { onDoctorSelect?: (doctorId: string) => void }) {
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
    <div className="card bg-base-100 shadow-xl mb-6">
      <div className="card-body flex flex-col items-center">
        <h2 className="card-title text-center mb-4">Find a Doctor</h2>
        <div className="form-control w-full relative">
          <input
            type="text"
            placeholder="Search doctors..."
            className="input input-bordered w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {loading && <p className="text-sm text-gray-500 mt-2">Loading...</p>}
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          {filteredDoctors.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-base-100 shadow-xl rounded-box max-h-64 overflow-auto">
              {filteredDoctors.map((doctor) => (
                <li
                  key={doctor.id}
                  className="p-2 hover:bg-base-200 cursor-pointer"
                  onClick={() => {
                    if (onDoctorSelect) {
                      onDoctorSelect(doctor.id);
                    } else {
                      router.push(`/dashboard/doctor/${doctor.id}`);
                    }
                  }}
                >
                  <div className="font-medium">{doctor.name}</div>
                  <div className="text-sm text-gray-500">
                    {doctor.specializations?.join(', ') || 'No specializations'}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {!loading && !error && searchTerm.length >= 3 && filteredDoctors.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">No doctors found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
