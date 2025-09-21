

import React from 'react';
import { useAppointmentStore } from '../../store/appointmentStore';
import CenteredLoader from './CenteredLoader';
import { useAuth } from '../../context/AuthContext';


const UpcomingAppointment = () => {
  const { appointments, loading } = useAppointmentStore();
  const { role } = useAuth();

  // Find all accepted, future appointments
  const now = new Date();
  const futureAccepted = appointments
    .filter((a) => {
      const dateTime = new Date(`${a.preferredDate}T${a.preferredTime}`);
      return a.status === 'accepted' && dateTime > now;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.preferredDate}T${a.preferredTime}`).getTime();
      const dateB = new Date(`${b.preferredDate}T${b.preferredTime}`).getTime();
      return dateA - dateB;
    });

  // The soonest upcoming appointment
  const upcoming = futureAccepted[0] || null;

  // Show doctor or patient name depending on role
  let nameLabel = '';
  let nameValue = '';
  if (upcoming) {
    if (role === 'doctor') {
      nameLabel = 'Patient';
      nameValue = upcoming.patientName || 'Unknown';
    } else {
      nameLabel = 'Doctor';
      nameValue = upcoming.doctorName || 'Unknown';
    }
  }

  return (
    <div className="w-full">
      <div>
        <div className="text-lg font-semibold text-primary mb-2">Upcoming Appointment</div>
        <div className="text-base text-orange-500">
          {loading ? (
            <CenteredLoader />
          ) : upcoming ? (
            <span className="block text-orange-500 whitespace-nowrap overflow-hidden text-ellipsis max-w-full" style={{wordBreak: 'break-word'}}>
              {upcoming.preferredDate} at {upcoming.preferredTime} &nbsp; {nameLabel}: {nameValue}
            </span>
          ) : (
            <span className="text-gray-600">No upcoming appointment</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpcomingAppointment;
