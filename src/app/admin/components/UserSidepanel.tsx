"use client";

import { useAdminStore } from "@/store/adminStore";
import { useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "./ToastProvider";
import { UserRole } from "@/domain/entities/UserRole";
import { useDI } from "@/context/DIContext";

export function UserSidepanel() {
  const {
    users,
    selectedUserId,
    isPanelOpen,
    selectUser,
    deleteUser,
    loading,
    error,
    updateSelected,
    updateDoctorProfile,
    loadSelectedDetails,
  } = useAdminStore();
  const {
    getAdminUserByIdUseCase,
    getAdminDoctorProfileUseCase,
    updateAdminUserUseCase,
    updateAdminDoctorProfileUseCase,
    approveDoctorUseCase,
    deleteUserAccountUseCase,
    resetAdminUserPasswordUseCase,
  } = useDI();

  const user = useMemo(() => users.find(u => u.id === selectedUserId) ?? null, [users, selectedUserId]) as (typeof users[number] & { approvalStatus?: 'pending' | 'approved' }) | null;
  const [resetLink, setResetLink] = useState<string | null>(null);
  const { showToast } = useToast();
  const [local, setLocal] = useState<{ name?: string; surname?: string; email?: string; role?: UserRole; specialization?: string; bio?: string; specializations?: string[] }>({});
  const panelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (selectedUserId) {
      loadSelectedDetails(
        getAdminUserByIdUseCase.execute.bind(getAdminUserByIdUseCase),
        getAdminDoctorProfileUseCase.execute.bind(getAdminDoctorProfileUseCase)
      );
    }
  }, [selectedUserId, loadSelectedDetails, getAdminUserByIdUseCase, getAdminDoctorProfileUseCase]);
  useEffect(() => {
    if (user) {
      setLocal({
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: (user.role as UserRole) ?? undefined,
        specialization: user.specialization,
        bio: user.bio,
        specializations: user.specializations,
      });
    }
  }, [user]);

  // Allow page scroll; close panel on outside click
  useEffect(() => {
    if (!isPanelOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(target)) {
        selectUser(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPanelOpen, selectUser]);

  const panelClass = `fixed right-0 top-0 h-screen w-full sm:w-[520px] md:w-[640px] bg-white shadow-2xl p-0 font-app rounded-l-2xl transition-transform duration-300 ease-out ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`;

  const save = async () => {
    try {
      await updateSelected(
        { name: local.name, surname: local.surname, role: local.role, email: local.email },
        updateAdminUserUseCase.execute.bind(updateAdminUserUseCase)
      );
      if (local.role === UserRole.Doctor) {
        await updateDoctorProfile(
          { specialization: local.specialization, bio: local.bio, specializations: local.specializations },
          updateAdminDoctorProfileUseCase.execute.bind(updateAdminDoctorProfileUseCase)
        );
      }
      showToast('Profile updated', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to update profile', 'error');
    }
  };

  const approve = async () => {
    if (!user) return;
    try {
      await useAdminStore.getState().approveDoctor(
        user.id,
        approveDoctorUseCase.execute.bind(approveDoctorUseCase)
      );
      showToast('Doctor approved', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to approve doctor', 'error');
    }
  };

  const generateReset = async () => {
    if (!user) return;
    try {
      const res = await resetAdminUserPasswordUseCase.execute(user.id);
      setResetLink(res.resetLink || null);
      showToast(res.resetLink ? 'Password reset link generated' : 'Password reset requested', res.resetLink ? 'success' : 'info');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to generate reset link', 'error');
    }
  };

  const copyReset = async () => {
    if (!resetLink) return;
    try { await navigator.clipboard.writeText(resetLink); showToast('Copied to clipboard', 'success'); }
    catch { showToast('Failed to copy', 'error'); }
  };

  if (!isPanelOpen) return null;
  return (
    <>
      <aside ref={panelRef} className={panelClass} aria-hidden={false} tabIndex={0}>
        {/* Header */}
  <div className="sticky top-0 flex items-center justify-between border-b bg-white px-4 py-3 rounded-tl-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-600">👤</span>
            <h3 className="text-base sm:text-lg font-semibold">Edit User</h3>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-full border border-gray-300 hover:bg-gray-100" onClick={() => selectUser(null)} aria-label="Close sidebar">Close</button>
            <button className="px-4 py-1.5 rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60" disabled={loading} onClick={save}>Save</button>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 py-4 overflow-y-auto h-[calc(100vh-60px)]">
          {error && <div className="mb-3 rounded-md bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>}
          {user && user.role === UserRole.Doctor && user.approvalStatus === 'pending' && (
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm">
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs bg-yellow-100 text-yellow-700">
                  Pending approval
                </span>
              </div>
              <button className="px-3 py-1.5 rounded-full bg-green-600 text-white hover:bg-green-700 disabled:opacity-60" disabled={loading} onClick={approve}>Approve</button>
            </div>
          )}
          {!user ? (
            <div className="text-gray-600">No user selected.</div>
          ) : (
            <div className="space-y-6">
              {/* Role selector */}
              <div>
                <label className="text-sm text-gray-600">Role</label>
                <select className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300" value={local.role ?? UserRole.Patient} onChange={e => setLocal({ ...local, role: e.target.value as unknown as UserRole })}>
                  <option value={UserRole.Patient}>Patient</option>
                  <option value={UserRole.Doctor}>Doctor</option>
                  <option value={UserRole.Admin}>Admin</option>
                </select>
              </div>

              {/* Base user fields (always shown) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700">User details</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm text-gray-600">Name</span>
                    <input className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300" value={local.name ?? ''} onChange={e => setLocal({ ...local, name: e.target.value })} />
                  </label>
                  <label className="block">
                    <span className="text-sm text-gray-600">Surname</span>
                    <input className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300" value={local.surname ?? ''} onChange={e => setLocal({ ...local, surname: e.target.value })} />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-sm text-gray-600">Email</span>
                    <input type="email" className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300" value={local.email ?? ''} onChange={e => setLocal({ ...local, email: e.target.value })} />
                  </label>
                </div>
              </div>

              {/* Doctor fields */}
              {local.role === UserRole.Doctor && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700">Doctor details</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-sm text-gray-600">Specialization</span>
                      <input className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300" value={local.specialization ?? ''} onChange={e => setLocal({ ...local, specialization: e.target.value })} />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="text-sm text-gray-600">Bio</span>
                      <textarea className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300" rows={4} value={local.bio ?? ''} onChange={e => setLocal({ ...local, bio: e.target.value })} />
                    </label>
                  </div>
                </div>
              )}

              {/* Utilities */}
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <button className="px-4 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60" disabled={loading} onClick={save}>Save changes</button>
                  <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-800 hover:bg-gray-100" disabled={loading} onClick={() => selectUser(null)}>Cancel</button>
                  <button className="px-4 py-2 rounded-full border border-red-300 text-red-600 hover:bg-red-50" disabled={loading} onClick={() => { if (user && confirm('Delete this user?')) deleteUser(user.id, deleteUserAccountUseCase.execute.bind(deleteUserAccountUseCase)); }}>Delete user</button>
                </div>

                <div className="mt-2 rounded-xl border bg-gray-50 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Password reset</div>
                      <div className="text-xs text-gray-600">Generate and copy a reset link</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 rounded-full bg-white border border-gray-300 hover:bg-gray-100" disabled={loading} onClick={generateReset}>Generate</button>
                      <button className="px-3 py-1.5 rounded-full bg-white border border-gray-300 hover:bg-gray-100" disabled={!resetLink} onClick={copyReset}>Copy</button>
                    </div>
                  </div>
                  {resetLink && (
                    <div className="mt-2 text-xs text-gray-700 break-all">{resetLink}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
