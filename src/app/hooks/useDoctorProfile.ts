import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebaseconfig';

interface Doctor {
  id: string;
  name: string;
  surname: string;
  about?: string;
  expertise?: string[];
  education?: string[];
}

export const useDoctorProfile = (id: string) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const doctorSnap = await getDoc(doc(db, 'users', id));
        if (doctorSnap.exists()) {
          setDoctor({ id: doctorSnap.id, ...doctorSnap.data() } as Doctor);
        } else {
          setError('Doctor not found');
        }
      } catch (err) {
        console.error('Error fetching doctor:', err);
        setError('Failed to fetch doctor data');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  return { doctor, loading, error };
};
