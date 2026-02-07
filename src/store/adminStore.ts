import { create } from 'zustand';
import type { User } from '@/domain/entities/User';
import {
  AdminUserCreatePayload,
  AdminUserUpdatePayload,
  createAdminUser,
  deleteAdminUser,
  fetchAdminUser,
  fetchAdminUsers,
  resetAdminUserPassword,
  updateAdminUser,
} from '@/network/adminUsers';

type EditableUser = User & {
  // optional base profile fields (may be absent in base User entity)
  name?: string;
  surname?: string;
  patientNotes?: string;
  allergies?: string;
  chronicConditions?: string;
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
  selectedUserId: string | null;
  isPanelOpen: boolean;
  searchQuery: string;
  loading: boolean;
  error: string | null;
  // actions
  loadUsers: () => Promise<void>;
  loadUsersPage: (page: number) => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  selectUser: (id: string | null) => void;
  loadSelectedDetails: () => Promise<void>;
  updateSelected: (payload: AdminUserUpdatePayload) => Promise<void>;
  updateDoctorProfile: (payload: AdminUserUpdatePayload) => Promise<void>;
  approveDoctor: (id: string) => Promise<void>;
  resetPassword: (id: string) => Promise<{ resetLink?: string } | null>;
  deleteUser: (id: string) => Promise<void>;
  createManagedUser: (payload: AdminUserCreatePayload) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  users: [],
  total: 0,
  pageSize: 20,
  page: 0,
  selectedUserId: null,
  isPanelOpen: false,
  searchQuery: '',
  loading: false,
  error: null,
  async loadUsers() {
    await get().loadUsersPage(0);
  },
  async loadUsersPage(page) {
    const { pageSize, searchQuery } = get();
    set({ loading: true, error: null });
    try {
      const response = await fetchAdminUsers({ page, pageSize, search: searchQuery || undefined });
      const items = response.items.map((u) => ({
        ...(u as EditableUser),
        approvalStatus: (u as unknown as { approvalStatus?: 'pending' | 'approved' }).approvalStatus,
      }));
      set({ users: items, total: response.total, page: response.page });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to load users' });
    } finally {
      set({ loading: false });
    }
  },
  async searchUsers(query) {
    const trimmed = query.trim().toLowerCase();
    set({ searchQuery: trimmed });
    await get().loadUsersPage(0);
  },
  selectUser(id) {
    set({ selectedUserId: id, isPanelOpen: !!id });
  },
  async loadSelectedDetails() {
    const id = get().selectedUserId; if (!id) return;
    set({ loading: true, error: null });
    try {
      const base = await fetchAdminUser(id);
      const users = get().users.map((u) => (u.id === id ? ({
        ...u,
        ...(base as EditableUser),
        approvalStatus: (base as unknown as { approvalStatus?: 'pending' | 'approved' })?.approvalStatus ?? u.approvalStatus,
      }) : u));
      set({ users });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to load details' });
    } finally {
      set({ loading: false });
    }
  },
  async updateSelected(payload) {
    const id = get().selectedUserId; if (!id) return;
    set({ loading: true, error: null });
    try {
      await updateAdminUser(id, payload);
      const users = get().users.map(u => (u.id === id ? { ...u, ...payload } : u));
      set({ users });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to update user' });
    } finally {
      set({ loading: false });
    }
  },
  async updateDoctorProfile(payload) {
    const id = get().selectedUserId; if (!id) return;
    set({ loading: true, error: null });
    try {
      await updateAdminUser(id, payload);
      const users = get().users.map(u => (u.id === id ? { ...u, ...payload } : u));
      set({ users });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to update doctor profile' });
    } finally {
      set({ loading: false });
    }
  },
  async approveDoctor(id) {
    set({ loading: true, error: null });
    try {
      await updateAdminUser(id, { approvalStatus: 'approved' });
      const users = get().users.map(u => (u.id === id ? ({ ...u, approvalStatus: 'approved' } as EditableUser & { approvalStatus: 'approved' }) : u));
      set({ users });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to approve doctor' });
    } finally {
      set({ loading: false });
    }
  },
  async resetPassword(id) {
    set({ loading: true, error: null });
    try {
      return await resetAdminUserPassword(id);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to reset password' });
      return null;
    } finally {
      set({ loading: false });
    }
  },
  async deleteUser(id) {
    set({ loading: true, error: null });
    try {
      await deleteAdminUser(id);
      await get().loadUsers();
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to delete user' });
    } finally {
      set({ loading: false });
    }
  },
  async createManagedUser(
    payload: AdminUserCreatePayload,
  ) {
    set({ loading: true, error: null });
    try {
      await createAdminUser(payload);
      await get().loadUsers();
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to create user' });
    } finally {
      set({ loading: false });
    }
  }
}));
