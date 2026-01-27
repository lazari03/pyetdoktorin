'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchDoctors } from "@/infrastructure/services/doctorService";
import { Doctor } from '@/domain/entities/Doctor';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { SearchType } from '@/models/FirestoreConstants';

interface DoctorSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: DOMRect | null;
}

export default function DoctorSearchModal({ isOpen, onClose, position }: DoctorSearchModalProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const nav = useNavigationCoordinator();

  const fetchDoctorsList = useCallback(async (term: string) => {
    setLoading(true);
    setError('');
    setFilteredDoctors([]);

    try {
      const doctorsByName = await fetchDoctors(term, SearchType.Name);
      const doctorsBySpecializations = await fetchDoctors(term, SearchType.Specializations);
      const uniqueDoctors = Array.from(
        new Map([...doctorsByName, ...doctorsBySpecializations].map((doc) => [doc.id, doc])).values()
      );
      setFilteredDoctors(uniqueDoctors);
    } catch {
      setError(t('failedToFetchDoctors'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // ...existing code (rest of the component)
}
