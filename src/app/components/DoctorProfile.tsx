'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useDoctorProfile } from '../hooks/useDoctorProfile';
import AppointmentModal from './AppointmentModal';
import { useAuth } from '../../context/AuthContext'; // Import AuthContext

interface DoctorProfileProps {
  id: string;
}

export default function DoctorProfile({ id }: DoctorProfileProps) {
  const { doctor, loading, error } = useDoctorProfile(id);
  const { user, role } = useAuth(); // Access user and role from AuthContext
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRequestAppointment = useCallback(() => {
    if (!user) {
      alert('You must be logged in to request an appointment.');
      return;
    }

    setIsModalOpen(true);
  }, [user]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="w-full max-w-4xl mx-auto p-3 md:p-6">
      <div className="card bg-base-100 shadow-xl overflow-hidden flex flex-col md:flex-row">
        <DoctorImage name={doctor?.name} surname={doctor?.surname} />
        <DoctorDetails doctor={doctor} onRequestAppointment={handleRequestAppointment} />
      </div>

      {isModalOpen && doctor && (
        <AppointmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          doctor={{ id: doctor.id, name: doctor.name }} // Pass doctor details
        />
      )}
    </div>
  );
}

function DoctorImage({ name, surname }: { name?: string; surname?: string }) {
  return (
    <figure className="w-full md:w-1/3 p-6 flex items-center justify-center">
      <Image
        src="/img/profile_placeholder.png"
        alt={`${name || 'Doctor'} ${surname || ''}`}
        width={192}
        height={192}
        className="object-cover rounded-full"
      />
    </figure>
  );
}

function DoctorDetails({ doctor, onRequestAppointment }: { doctor: any; onRequestAppointment: () => void }) {
  return (
    <div className="card-body w-full md:w-2/3 p-6">
      <h2 className="card-title text-3xl">
        {doctor.name} {doctor.surname}
      </h2>
      <p className="text-lg text-gray-700 mt-2">{doctor.about || 'No bio available'}</p>
      <div className="divider my-3"></div>
      <DoctorList title="Specializations" items={doctor.specializations} fallback="No specializations listed" />
      <div className="divider my-3"></div>
      <DoctorList title="Education" items={doctor.education} fallback="No education details available" />
      <div className="card-actions justify-end mt-6">
        <button className="btn btn-primary" onClick={onRequestAppointment}>
          Request Appointment
        </button>
      </div>
    </div>
  );
}

function DoctorList({ title, items, fallback }: { title: string; items?: string[]; fallback: string }) {
  return (
    <>
      <h3 className="text-xl font-semibold">{title}</h3>
      {items?.length ? (
        <ul className="list-disc list-inside">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>{fallback}</p>
      )}
    </>
  );
}