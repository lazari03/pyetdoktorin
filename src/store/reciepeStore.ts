import { create } from 'zustand';
import { UserRole } from '@/domain/entities/UserRole';
import type { ReciepePayload } from '@/application/ports/IReciepeService';
import { ReciepeService } from '@/infrastructure/services/reciepeService';

const reciepeService = new ReciepeService();

interface ReciepeState {
  reciepes: ReciepePayload[];
  loading: boolean;
  error: unknown;
  lastFetchedAt: number;
  fetchReciepes: (role: UserRole, uid: string, forceRefresh?: boolean) => Promise<void>;
  setReciepes: (reciepes: ReciepePayload[]) => void;
}

function listForRole(role: UserRole, uid: string): Promise<ReciepePayload[]> {
  switch (role) {
    case UserRole.Doctor:
      return reciepeService.listByDoctor(uid);
    case UserRole.Patient:
      return reciepeService.listByPatient(uid);
    case UserRole.Pharmacy:
      return reciepeService.listByPharmacy(uid);
    default:
      return Promise.resolve([]);
  }
}

export const useReciepeStore = create<ReciepeState>((set, get) => ({
  reciepes: [],
  loading: false,
  error: null,
  lastFetchedAt: 0,
  setReciepes: (reciepes) => set({ reciepes }),
  fetchReciepes: async (role, uid, forceRefresh = false) => {
    const state = get();
    // Same 10s freshness guard as appointmentStore — avoids redundant fetches
    // when multiple components mount and call fetchReciepes in parallel.
    if (
      !forceRefresh &&
      state.reciepes.length > 0 &&
      Date.now() - state.lastFetchedAt < 10_000
    ) {
      return;
    }
    set({ loading: true, error: null });
    try {
      const reciepes = await listForRole(role, uid);
      set({ reciepes, loading: false, lastFetchedAt: Date.now() });
    } catch (error) {
      set({ loading: false, error });
    }
  },
}));
