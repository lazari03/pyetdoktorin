import { NextRequest, NextResponse } from 'next/server';
import { getAdmin } from '../../_lib/admin';
import { UserRole } from '@/domain/entities/UserRole';
import { normalizeRole } from '@/domain/rules/userRules';

export async function POST(req: NextRequest) {
  const role = normalizeRole(req.cookies.get('userRole')?.value);
  if (role !== UserRole.Admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  interface ResetPasswordPayload { userId: string }
  const body = (await req.json().catch(() => null)) as ResetPasswordPayload | null;
  if (!body || typeof body.userId !== 'string') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  try {
    const { auth, db } = getAdmin();
    const user = await auth.getUser(body.userId);
    // Generate reset link (requires email)
    const link = await auth.generatePasswordResetLink(user.email!);
    // Optionally log or store a reset request entry
    await db.collection('admin_events').add({
      type: 'password_reset_link_generated',
      userId: body.userId,
      email: user.email,
      at: Date.now(),
    });
    return NextResponse.json({ ok: true, resetLink: link }, { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to reset password';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
