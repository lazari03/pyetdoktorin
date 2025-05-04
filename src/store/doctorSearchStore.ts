import { create } from 'zustand';
import { fetchDoctors } from '../services/doctorService';
import { Doctor } from '../models/Doctor';
import { SearchType } from '../models/FirestoreConstants';
import { debounce } from 'lodash'; // Import debounce utility

interface DoctorSearchState {
  searchTerm: string;
  filteredDoctors: Doctor[];
  loading: boolean;
  error: string | null;
  isOverlayVisible: boolean;
  setSearchTerm: (term: string) => void;
  toggleOverlay: (visible: boolean) => void;
  fetchDoctors: () => Promise<void>;
  reset: () => void;
}

export const useDoctorSearchStore = create<DoctorSearchState>((set, get) => {
  const debouncedFetchDoctors = debounce(async () => {
    const { searchTerm } = get();
    const normalizedSearchTerm = searchTerm.trim().toLowerCase(); // Normalize the search term for case-insensitive search

    if (normalizedSearchTerm.length < 4) { // Start searching after 4 characters
      set({ filteredDoctors: [], error: null });
      return;
    }

    set({ loading: true, error: null });
    try {
      const doctorsByName = await fetchDoctors(normalizedSearchTerm, SearchType.Name);
      const doctorsBySpecializations = await fetchDoctors(normalizedSearchTerm, SearchType.Specializations);

      // Combine and filter unique doctors
      const uniqueDoctors = Array.from(
        new Map([...doctorsByName, ...doctorsBySpecializations].map((doc) => [doc.id, doc])).values()
      );

      set({ filteredDoctors: uniqueDoctors });
    } catch (error) {
      console.error('Error fetching doctors:', error);
      set({ error: 'Failed to fetch doctors. Please try again.' });
    } finally {
      set({ loading: false });
    }
  }, 300); // Add a debounce delay of 300 milliseconds

  return {
    searchTerm: '',
    filteredDoctors: [],
    loading: false,
    error: null,
    isOverlayVisible: false,

    setSearchTerm: (term) => set({ searchTerm: term }),

    toggleOverlay: (visible) => set({ isOverlayVisible: visible }),

    fetchDoctors: () => new Promise<void>((resolve) => {
      debouncedFetchDoctors();
      resolve(); // Ensure the function always returns a Promise<void>
    }),

    reset: () => set({ searchTerm: '', filteredDoctors: [], error: null, isOverlayVisible: false }),
  };
});
