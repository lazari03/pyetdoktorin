'use client';

import { useState } from 'react';
import AppointmentModal from '../components/AppointmentModal';

function DoctorProfile({ doctor, onRequestBooking }: { doctor: { id: string; name: string }; onRequestBooking: () => void }) {
  return (
    <div className="card bg-base-100 shadow-md p-4">
      <h2 className="text-xl font-bold">{doctor.name}</h2>
      <button className="btn btn-secondary mt-2" onClick={onRequestBooking}>
        Request Booking
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const doctor = { id: '123', name: 'Dr. John Doe' }; // Example doctor data

  return (
    <div>
      <h1 className="text-2xl font-bold">Profile Page</h1>
      <DoctorProfile doctor={doctor} onRequestBooking={openModal} />
      <AppointmentModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
