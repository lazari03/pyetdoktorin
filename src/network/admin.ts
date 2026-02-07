export async function apiCreateAdmin(payload: { name: string; surname: string; email: string; password: string; role: string; phone?: string }) {
  const res = await fetch('/api/admin/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Failed to create user');
  return data as { id: string; role: string };
}

export async function apiResetPassword(userId: string) {
  const res = await fetch('/api/admin/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Failed to reset password');
  return data as { ok: boolean; resetLink?: string };
}

export async function apiDeleteUser(userId: string) {
  const res = await fetch('/api/admin/delete-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Failed to delete user');
  return data as { ok: boolean };
}

export async function apiUpdateUser(payload: {
  id: string;
  userFields?: Record<string, unknown>;
  doctorFields?: Record<string, unknown>;
  approveDoctor?: boolean;
}) {
  const res = await fetch('/api/admin/update-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Failed to update user');
  return data as { ok: boolean };
}
