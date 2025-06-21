import React from 'react';
import Link from 'next/link';
import { Appointment } from '../../models/Appointment';
import { AppointmentsTable as SharedAppointmentsTable } from '../components/SharedAppointmentsTable';

// Remove the local AppointmentsTable implementation and only re-export the shared component
export { AppointmentsTable } from './SharedAppointmentsTable';
