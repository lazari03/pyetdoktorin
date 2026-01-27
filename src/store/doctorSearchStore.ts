
import { create } from 'zustand';
import { fetchDoctors } from '@/infrastructure/services/doctorService';
import { Doctor } from '@/domain/entities/Doctor';
import { SearchType } from '../models/FirestoreConstants';
import { debounce } from 'lodash';

interface DoctorSearchState {
  searchTerm: string;
  filteredDoctors: Doctor[];
  loading: boolean;
  error: string | null;
  isOverlayVisible: boolean;
  setSearchTerm: (term: string) => void;
  fetchDoctors: () => Promise<void>;
  reset: () => void;
  clearResults: () => void;
  toggleOverlay: (visible: boolean) => void;
}

export const useDoctorSearchStore = create<DoctorSearchState>((set, get) => {
  const debouncedFetchDoctors = debounce(async () => {
    const { searchTerm } = get();
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    set({ loading: true, error: null });
    try {
      const doctorsByName = await fetchDoctors(normalizedSearchTerm, SearchType.Name);
      const doctorsBySpecializations = await fetchDoctors(normalizedSearchTerm, SearchType.Specializations);

      // Combine and filter unique doctors
      let uniqueDoctors = Array.from(
        new Map([...doctorsByName, ...doctorsBySpecializations].map((doc) => [doc.id, doc])).values()
      );

      // If search term is empty or less than 4 chars, show all doctors
      if (!normalizedSearchTerm || normalizedSearchTerm.length < 4) {
        // Fetch all doctors (already done by Firestore query)
        uniqueDoctors = await fetchDoctors("", SearchType.Name);
      }

      // Further filter for partial/case-insensitive match on name or specialization
      if (normalizedSearchTerm && normalizedSearchTerm.length >= 1) {
        uniqueDoctors = uniqueDoctors.filter((doctor) => {
          const nameMatch = doctor.name && doctor.name.toLowerCase().includes(normalizedSearchTerm);
          const specMatch = doctor.specialization && doctor.specialization.some((spec) => spec.toLowerCase().includes(normalizedSearchTerm));
          return nameMatch || specMatch;
        });
      }

      set({ filteredDoctors: uniqueDoctors });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch doctors.' });
    } finally {
      set({ loading: false });
    }
  }, 300);

  return {
    searchTerm: '',
    filteredDoctors: [],
    loading: false,
    error: null,
    isOverlayVisible: false,

    setSearchTerm: (term) => set({ searchTerm: term }),

    fetchDoctors: () => new Promise<void>((resolve) => {
      debouncedFetchDoctors();
      resolve();
    }),

    reset: () => set({ searchTerm: '', filteredDoctors: [], error: null, isOverlayVisible: false }),
    clearResults: () => set({ filteredDoctors: [], error: null }),
    toggleOverlay: (visible) => set({ isOverlayVisible: visible }),
  };
});
