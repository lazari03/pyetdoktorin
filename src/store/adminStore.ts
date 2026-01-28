import { create } from 'zustand';
import type { User } from '@/domain/entities/User';
import { UserRole } from '@/domain/entities/UserRole';
import type { QueryDocumentSnapshot } from 'firebase/firestore';

type EditableUser = User & {
  // optional base profile fields (may be absent in base User entity)
  name?: string;
  surname?: string;
  // doctor-extendable fields for editing in panel
  specialization?: string;
  bio?: string;
  specializations?: string[];
  approvalStatus?: 'pending' | 'approved';
};

interface AdminState {
  users: EditableUser[];
  total: number;
  pageSize: number;
  page: number;
  cursors: QueryDocumentSnapshot[]; // Firestore DocumentSnapshot[] for startAfter
  selectedUserId: string | null;
  isPanelOpen: boolean;
  searchQuery: string;
  loading: boolean;
  error: string | null;
  // actions
  loadUsers: (getAllUsersUseCase: () => Promise<User[]>) => Promise<void>;
  loadUsersPage: (page: number, getUsersPageUseCase: (pageSize: number, cursor?: QueryDocumentSnapshot) => Promise<{ items: User[]; total: number; nextCursor?: QueryDocumentSnapshot }>) => Promise<void>;
  searchUsers: (query: string, getAllUsersUseCase: () => Promise<User[]>, getUsersPageUseCase: (pageSize: number, cursor?: QueryDocumentSnapshot) => Promise<{ items: User[]; total: number; nextCursor?: QueryDocumentSnapshot }>) => Promise<void>;
  selectUser: (id: string | null) => void;
  loadSelectedDetails: (
    getUserByIdUseCase: (id: string) => Promise<User | null>,
    getDoctorProfileUseCase: (id: string) => Promise<(User & { name?: string; surname?: string; specialization?: string; bio?: string; specializations?: string[] }) | null>
  ) => Promise<void>;
  updateSelected: (payload: { name?: string; surname?: string; role?: User['role']; email?: string }, updateAdminUserUseCase: (id: string, payload: { name?: string; surname?: string; role?: User['role']; email?: string }) => Promise<void>) => Promise<void>;
  updateDoctorProfile: (payload: { specialization?: string; bio?: string; specializations?: string[] }, updateAdminDoctorProfileUseCase: (id: string, payload: { specialization?: string; bio?: string; specializations?: string[] }) => Promise<void>) => Promise<void>;
  approveDoctor: (id: string, approveDoctorUseCase: (id: string) => Promise<void>) => Promise<void>;
  resetPassword: (id: string, resetAdminUserPasswordUseCase: (id: string) => Promise<{ resetLink?: string }>) => Promise<{ resetLink?: string } | null>;
  deleteUser: (id: string, deleteUserAccountUseCase: (id: string) => Promise<void>) => Promise<void>;
  createAdmin: (payload: { name: string; surname: string; email: string; password: string }, createAdminUserUseCase: (payload: { name: string; surname: string; email: string; password: string }) => Promise<User>, getAllUsersUseCase: () => Promise<User[]>) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  users: [],
  total: 0,
  pageSize: 20,
  page: 0,
  cursors: [],
  selectedUserId: null,
  isPanelOpen: false,
  searchQuery: '',
  loading: false,
  error: null,
  async loadUsers(getAllUsersUseCase) {
    set({ loading: true, error: null });
    try {
      const users = await getAllUsersUseCase();
      // Coerce base users into EditableUser shape and carry approvalStatus if present
      const editable = users.map(u => ({
        ...u,
        approvalStatus: (u as unknown as { approvalStatus?: 'pending' | 'approved' }).approvalStatus,
      })) as EditableUser[];
      set({ users: editable, total: editable.length });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to load users' });
    } finally {
      set({ loading: false });
    }
  },
  async loadUsersPage(page, getUsersPageUseCase) {
    const { pageSize, cursors } = get();
    set({ loading: true, error: null });
    try {
      // Determine cursor: for page 0, no cursor; for >0, use last known cursor
      const cursor = page > 0 ? cursors[page - 1] : undefined;
      const res = await getUsersPageUseCase(pageSize, cursor);
      const nextCursors = [...cursors];
      if (res.nextCursor && nextCursors[page] !== res.nextCursor) {
        nextCursors[page] = res.nextCursor;
      }
      const items = (res.items as EditableUser[]).map(u => ({
        ...u,
        approvalStatus: (u as unknown as { approvalStatus?: 'pending' | 'approved' }).approvalStatus,
      }));
      set({ users: items, total: res.total, page, cursors: nextCursors, searchQuery: '' });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to load users' });
    } finally {
      set({ loading: false });
    }
  },
  async searchUsers(query, getAllUsersUseCase, getUsersPageUseCase) {
    const q = query.trim().toLowerCase();
    if (!q) {
      // empty query resets to first page
      await get().loadUsersPage(0, getUsersPageUseCase);
      return;
    }
    set({ loading: true, error: null, searchQuery: q });
    try {
      // Fetch all users and filter client-side to cover global dataset
      const all = await getAllUsersUseCase();
      const editable = all.map(u => ({
        ...u,
        approvalStatus: (u as unknown as { approvalStatus?: 'pending' | 'approved' }).approvalStatus,
      })) as EditableUser[];
      const filtered = editable.filter(u => {
        const hay = `${u.name ?? ''} ${u.surname ?? ''} ${u.email ?? ''} ${u.role ?? ''}`.toLowerCase();
        return hay.includes(q);
      });
      set({ users: filtered, total: filtered.length, page: 0 });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to search users' });
    } finally {
      set({ loading: false });
    }
  },
  selectUser(id) {
    set({ selectedUserId: id, isPanelOpen: !!id });
  },
  async loadSelectedDetails(getUserByIdUseCase, getDoctorProfileUseCase) {
    const id = get().selectedUserId; if (!id) return;
    set({ loading: true, error: null });
    try {
      const base = await getUserByIdUseCase(id);
      const doc = await getDoctorProfileUseCase(id);
      const merged = doc ?? base; // prefer doctor details if available
      if (merged) {
        // replace matching user in list for up-to-date editing
        const mDoctor = merged as unknown as Partial<{ role?: UserRole; specialization?: string; bio?: string; specializations?: string[] }>;
        const doctorFields: Partial<EditableUser> = mDoctor.role === UserRole.Doctor ? {
          specialization: mDoctor.specialization,
          bio: mDoctor.bio,
          specializations: mDoctor.specializations,
        } : {};
        const users = get().users.map(u => (u.id === id ? {
          ...u,
          ...(base ?? {}),
          ...doctorFields,
          approvalStatus: (base as unknown as { approvalStatus?: 'pending' | 'approved' })?.approvalStatus ?? u.approvalStatus,
        } : u));
        set({ users });
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to load details' });
    } finally {
      set({ loading: false });
    }
  },
  async updateSelected(payload, updateAdminUserUseCase) {
    const id = get().selectedUserId; if (!id) return;
    set({ loading: true, error: null });
    try {
      await updateAdminUserUseCase(id, payload);
      const users = get().users.map(u => (u.id === id ? { ...u, ...payload } : u));
      set({ users });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to update user' });
    } finally {
      set({ loading: false });
    }
  },
  async updateDoctorProfile(payload, updateAdminDoctorProfileUseCase) {
    const id = get().selectedUserId; if (!id) return;
    set({ loading: true, error: null });
    try {
      await updateAdminDoctorProfileUseCase(id, payload);
      const users = get().users.map(u => (u.id === id ? { ...u, ...payload } : u));
      set({ users });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to update doctor profile' });
    } finally {
      set({ loading: false });
    }
  },
  async approveDoctor(id, approveDoctorUseCase) {
    set({ loading: true, error: null });
    try {
      await approveDoctorUseCase(id);
      const users = get().users.map(u => (u.id === id ? ({ ...u, approvalStatus: 'approved' } as EditableUser & { approvalStatus: 'approved' }) : u));
      set({ users });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to approve doctor' });
    } finally {
      set({ loading: false });
    }
  },
  async resetPassword(id, resetAdminUserPasswordUseCase) {
    set({ loading: true, error: null });
    try { return await resetAdminUserPasswordUseCase(id); } catch (e) { set({ error: e instanceof Error ? e.message : 'Failed to reset password' }); return null; }
    finally { set({ loading: false }); }
  },
  async deleteUser(id, deleteUserAccountUseCase) {
    set({ loading: true, error: null });
    try { await deleteUserAccountUseCase(id); } catch (e) { set({ error: e instanceof Error ? e.message : 'Failed to delete user' }); }
    finally { set({ loading: false }); }
  },
  async createAdmin(payload, createAdminUserUseCase, getAllUsersUseCase) {
    set({ loading: true, error: null });
    try { await createAdminUserUseCase(payload); await get().loadUsers(getAllUsersUseCase); }
    catch (e) { set({ error: e instanceof Error ? e.message : 'Failed to create admin' }); }
    finally { set({ loading: false }); }
  }
}));
