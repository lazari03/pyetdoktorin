'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebaseconfig';
import AppointmentModal from './AppointmentModal';

interface DoctorProfileProps {
  id: string;
}

export default function DoctorProfile({ id }: DoctorProfileProps) {
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const doctorSnap = await getDoc(doc(db, 'users', id)); // Fetch from 'users' collection
        if (doctorSnap.exists()) {
          setDoctor({ id: doctorSnap.id, ...doctorSnap.data() });
        } else {
          setError('Doctor not found');
        }
      } catch (err) {
        console.error('Error fetching doctor:', err);
        setError('Failed to fetch doctor data');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="w-full max-w-4xl mx-auto p-3 md:p-6">
      <div className="card bg-base-100 shadow-xl overflow-hidden flex flex-col md:flex-row">
        <figure className="w-full md:w-1/3 p-6 flex items-center justify-center">
          <Image
            src="/img/profile_placeholder.png"
            alt={`${doctor.name || 'Doctor'} ${doctor.surname || ''}`}
            width={192}
            height={192}
            className="object-cover rounded-full"
          />
        </figure>
        <div className="card-body w-full md:w-2/3 p-6">
          <h2 className="card-title text-3xl">
            {doctor.name} {doctor.surname}
          </h2>
          <p className="text-lg text-gray-700 mt-2">{doctor.about || 'No bio available'}</p>
          <div className="divider my-3"></div>
          <h3 className="text-xl font-semibold">Specializations</h3>
          <ul className="list-disc list-inside">
            {doctor.specializations?.length > 0 ? (
              doctor.specializations.map((spec: string, index: number) => <li key={index}>{spec}</li>)
            ) : (
              <p>No specializations listed</p>
            )}
          </ul>
          <div className="divider my-3"></div>
          <h3 className="text-xl font-semibold">Education</h3>
          <ul className="list-disc list-inside">
            {doctor.education?.length > 0 ? (
              doctor.education.map((degree: string, index: number) => <li key={index}>{degree}</li>)
            ) : (
              <p>No education details available</p>
            )}
          </ul>
          <div className="card-actions justify-end mt-6">
            <button
              className="btn btn-primary"
              onClick={() => setIsModalOpen(true)}
            >
              Request Appointment
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <AppointmentModal
          doctor={doctor}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}