export * from '../application/hooks/useDoctorProfile';
import { useState, useEffect, useMemo } from 'react';
import { Doctor } from '@/domain/entities/Doctor';
import { FirebaseUserRepository } from '@/infrastructure/repositories/FirebaseUserRepository';


export const useDoctorProfile = (id: string) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userRepo = useMemo(() => new FirebaseUserRepository(), []);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        // Use repository to fetch doctor profile
        const user = await userRepo.getById(id);
        if (user && user.name) {
          setDoctor({
            id: user.id,
            name: user.name,
            specialization: user.specialization ?? [],
            profilePicture: user.profilePicture,
          });
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
  }, [id, userRepo]);

  return { doctor, loading, error };
};
