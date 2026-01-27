import { useState, useEffect } from 'react';
import { Doctor } from '@/domain/entities/Doctor';
import { useDI } from '@/context/DIContext';


export const useDoctorProfile = (id: string) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { getDoctorProfileUseCase } = useDI();

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const profile = await getDoctorProfileUseCase.execute(id);
        if (profile) {
          setDoctor(profile);
        } else {
          setError('Doctor not found');
        }
      } catch {
        setError('Failed to fetch doctor data');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id, getDoctorProfileUseCase]);

  return { doctor, loading, error };
};
