import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { UserRole } from '@/domain/entities/UserRole';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';

const router = Router();
const DEFAULT_APPOINTMENT_PRICE = Number(process.env.NEXT_PUBLIC_PAYWALL_AMOUNT_USD || 13);

router.get('/admin', requireAuth([UserRole.Admin]), async (_req: AuthenticatedRequest, res) => {
  try {
    const admin = getFirebaseAdmin();
    const db = admin.firestore();
    const [appointmentsSnap, prescriptionsSnap, clinicsSnap, usersSnap] = await Promise.all([
      db.collection('appointments').get(),
      db.collection('recipe').get(),
      db.collection('clinicBookings').get(),
      db.collection('users').get(),
    ]);

    const totalAppointments = appointmentsSnap.size;
    const totalRecipes = prescriptionsSnap.size;
    const totalClinicBookings = clinicsSnap.size;
    const totalUsers = usersSnap.size;

    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    const monthlyRevenue = appointmentsSnap.docs.reduce((sum, doc) => {
      const data = doc.data() as { isPaid?: boolean; preferredDate?: string };
      if (!data.isPaid || !data.preferredDate) return sum;
      const date = new Date(data.preferredDate);
      if (date >= monthStart && date < nextMonthStart) {
        return sum + DEFAULT_APPOINTMENT_PRICE;
      }
      return sum;
    }, 0);

    res.json({
      totalAppointments,
      totalRecipes,
      totalClinicBookings,
      totalUsers,
      monthlyRevenue,
    });
  } catch (error) {
    console.error('Failed to load admin stats', error);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

export default router;
