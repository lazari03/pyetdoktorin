'use client';

import AppointmentModal from '../../components/AppointmentModal';
import { useState } from 'react';

export default function NewAppointmentPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <button className="btn btn-primary" onClick={openModal}>
        Request Booking
      </button>
      <AppointmentModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
