import { create } from 'zustand';
import { fetchDoctors } from '../services/doctorService';
import { Doctor } from '../models/Doctor'; // Import Doctor model

interface DoctorSearchState {
  searchTerm: string;
  filteredDoctors: Doctor[];
  loading: boolean;
  error: string | null;
  setSearchTerm: (term: string) => void;
  fetchDoctorsList: (searchType: 'name' | 'expertise') => Promise<void>;
  resetSearch: () => void;
}

export const useDoctorSearchStore = create<DoctorSearchState>((set, get) => ({
  searchTerm: '',
  filteredDoctors: [],
  loading: false,
  error: null,
  setSearchTerm: (term) => set({ searchTerm: term }),
  fetchDoctorsList: async (searchType) => {
    const { searchTerm } = get();
    if (searchTerm.trim().length < 4) {
      set({ filteredDoctors: [], error: null });
      return;
    }

    set({ loading: true, error: null });
    try {
      const doctors = await fetchDoctors(searchTerm.trim(), searchType);
      set({ filteredDoctors: doctors });
    } catch {
      set({ error: 'Failed to fetch doctors. Please try again.' });
    } finally {
      set({ loading: false });
    }
  },
  resetSearch: () => set({ searchTerm: '', filteredDoctors: [], error: null }),
}));
