import { NextRequest, NextResponse } from 'next/server';
import { getAdmin } from '@/app/api/_lib/admin';

const DEFAULT_APPOINTMENT_PRICE = Number(process.env.NEXT_PUBLIC_PAYWALL_AMOUNT_USD || 13);

function getMonthBoundaries() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
}

export async function GET(request: NextRequest) {
  const role = request.cookies.get('userRole')?.value?.toLowerCase();
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { db } = getAdmin();
  try {
    const [appointmentsSnap, recipesSnap, clinicsSnap, usersSnap] = await Promise.all([
      db.collection('appointments').get(),
      db.collection('recipe').get(),
      db.collection('clinicBookings').get(),
      db.collection('users').get(),
    ]);

    const totalAppointments = appointmentsSnap.size;
    const totalRecipes = recipesSnap.size;
    const totalClinicBookings = clinicsSnap.size;
    const totalUsers = usersSnap.size;

    const { start, end } = getMonthBoundaries();
    const monthlyRevenue = appointmentsSnap.docs.reduce((sum, doc) => {
      const data = doc.data() as { isPaid?: boolean; preferredDate?: string };
      if (!data.isPaid || !data.preferredDate) return sum;
      const date = new Date(data.preferredDate);
      if (date >= start && date < end) {
        return sum + DEFAULT_APPOINTMENT_PRICE;
      }
      return sum;
    }, 0);

    return NextResponse.json({
      totalAppointments,
      totalRecipes,
      totalClinicBookings,
      totalUsers,
      monthlyRevenue,
    });
  } catch (error) {
    console.error('Failed to load admin dashboard stats', error);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
