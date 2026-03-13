import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '@/middleware/auth';
import { UserRole } from '@/domain/entities/UserRole';
import { validateQuery } from '@/routes/validation';
import { getDoctorById, searchDoctors } from '@/services/doctorsService';

const router = Router();

const allowedRoles = [
  UserRole.Admin,
  UserRole.Doctor,
  UserRole.Patient,
  UserRole.Pharmacy,
  UserRole.Clinic,
] as const;

const searchDoctorsQuerySchema = z.object({
  q: z.string().optional(),
  type: z.enum(['name', 'specializations']).optional(),
});

router.get('/', requireAuth([...allowedRoles]), async (req, res) => {
  const query = validateQuery(res, searchDoctorsQuerySchema, req.query, 'INVALID_QUERY');
  if (!query) return;

  try {
    const items = await searchDoctors(query.q ?? '', query.type ?? 'name');
    res.json({ items });
  } catch (error) {
    console.error('Error searching doctors', error);
    res.status(500).json({ message: 'Failed to fetch doctors' });
  }
});

router.get('/:doctorId', requireAuth([...allowedRoles]), async (req, res) => {
  const { doctorId } = req.params as { doctorId: string };

  try {
    const doctor = await getDoctorById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    console.error('Error loading doctor profile', error);
    res.status(500).json({ message: 'Failed to fetch doctor' });
  }
});

export default router;
