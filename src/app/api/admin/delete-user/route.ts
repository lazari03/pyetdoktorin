import { NextRequest, NextResponse } from 'next/server';
import { getAdmin } from '../../_lib/admin';
import { UserRole } from '@/domain/entities/UserRole';

export async function POST(req: NextRequest) {
  const role = req.cookies.get('userRole')?.value;
  if (role !== UserRole.Admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  interface DeleteUserPayload { userId: string }
  const body = (await req.json().catch(() => null)) as DeleteUserPayload | null;
  if (!body || typeof body.userId !== 'string') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  try {
    const { auth, db } = getAdmin();
    await auth.deleteUser(body.userId);
    await db.collection('users').doc(body.userId).delete();
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to delete user';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
