'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../config/firebaseconfig';
import { useRouter } from 'next/navigation';

interface DoctorSearchInputProps {
  onSelect: (doctorId: string) => void;
}

export default function DoctorSearchInput({ onSelect }: DoctorSearchInputProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState<{ id: string; name?: string; expertise?: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length >= 2) {
        fetchDoctors(searchTerm);
      } else {
        setFilteredDoctors([]);
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchDoctors = async (term: string) => {
    setLoading(true);
    setIsSearching(true);
    setFilteredDoctors([]);

    try {
      const doctorsCollection = collection(db, 'users'); 
      const q = query(
        doctorsCollection,
        where('role', '==', 'doctor'),
        where('name', '>=', term),
        where('name', '<=', term + '\uf8ff')
      );

      const querySnapshot = await getDocs(q);
      const doctors = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setFilteredDoctors(doctors);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search for a doctor..."
        className="input input-bordered w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsSearching(true)}
      />

      {isSearching && (
        <div className="absolute z-10 w-full mt-1 bg-base-100 shadow-xl rounded-box max-h-64 overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : filteredDoctors.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No doctors found</div>
          ) : (
            <ul>
              {filteredDoctors.map((doctor) => (
                <li
                  key={doctor.id}
                  className="p-2 hover:bg-base-200 cursor-pointer"
                  onClick={() => {
                    setSearchTerm(doctor.name || '');
                    setIsSearching(false);
                    router.push(`/dashboard/doctor/${doctor.id}`);
                  }}
                >
                  <div className="font-medium">{doctor.name}</div>
                  <div className="text-sm text-gray-500">
                    {doctor.expertise || 'No expertise specified'}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
