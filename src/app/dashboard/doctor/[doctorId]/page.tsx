
'use client';

import DoctorProfile from '../../../components/doctor/DoctorProfile';
import React from 'react';

export default function DoctorPage({ params }: { params: Promise<{ doctorId: string }> }) {
  const { doctorId } = React.use(params);
  return <DoctorProfile id={doctorId} />;
}
