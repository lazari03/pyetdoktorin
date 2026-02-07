import { NextRequest, NextResponse } from 'next/server';
import { getAdmin } from '../../_lib/admin';
import { UserRole } from '@/domain/entities/UserRole';

const ALLOWED_ROLES: UserRole[] = [
  UserRole.Admin,
  UserRole.Patient,
  UserRole.Pharmacy,
  UserRole.Clinic,
  UserRole.Doctor,
];

export async function POST(req: NextRequest) {
  const currentRole = req.cookies.get('userRole')?.value;
  if (currentRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  if (!body || !body.email || !body.password || !body.name || !body.surname) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const requestedRoleRaw = typeof body.role === 'string' ? body.role.toLowerCase() : UserRole.Patient;
  const requestedRole = (ALLOWED_ROLES.find((r) => r === requestedRoleRaw) || UserRole.Patient) as UserRole;

  try {
    const { auth, db } = getAdmin();
    const createParams: Parameters<typeof auth.createUser>[0] = {
      email: body.email,
      password: body.password,
      displayName: `${body.name} ${body.surname}`.trim(),
    };
    if (body.phone) {
      createParams.phoneNumber = body.phone;
    }
    const userRecord = await auth.createUser(createParams);
    await auth.setCustomUserClaims(userRecord.uid, {
      role: requestedRole,
      admin: requestedRole === UserRole.Admin,
    });

    await db.collection('users').doc(userRecord.uid).set({
      name: body.name,
      surname: body.surname,
      role: requestedRole,
      email: body.email,
      phone: body.phone ?? null,
      createdBy: 'admin',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }, { merge: true });

    return NextResponse.json({ id: userRecord.uid, role: requestedRole }, { status: 200 });
  } catch (e: unknown) {
    const message = typeof e === 'object' && e && 'message' in e ? String((e as { message?: unknown }).message) : 'Failed to create user';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
