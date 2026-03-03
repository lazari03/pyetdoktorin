import { useCallback, useEffect, useState } from 'react';
import { Doctor } from '@/domain/entities/Doctor';
import { useDI } from '@/context/DIContext';


export const useDoctorProfile = (id: string) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const { getDoctorProfileUseCase } = useDI();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await getDoctorProfileUseCase.execute(id);
      if (profile) {
        setDoctor(profile);
      } else {
        setDoctor(null);
        setError(new Error('Doctor not found'));
      }
    } catch (err) {
      setDoctor(null);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [getDoctorProfileUseCase, id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { doctor, loading, error, refresh };
};
