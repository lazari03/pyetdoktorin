"use client";

import { useEffect, useState } from 'react';
import DoctorProfile from '../../../components/DoctorProfile';

export default function DoctorPage({ params }: { params: Promise<{ id: string }> }) {
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params; // Resolve the Promise
      setDoctorId(resolvedParams.id);
    };

    resolveParams();
  }, [params]);

  if (!doctorId) {
    return <p>Loading...</p>; // Show a loading state while resolving params
  }

  return <DoctorProfile id={doctorId} />;
}
