import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthenticatedRequest } from '@/middleware/auth';
import { UserRole } from '@/domain/entities/UserRole';
import { validateBody, validateQuery } from '@/routes/validation';
import {
  getAvailabilityForDoctor,
  getResolvedAvailabilityForDoctor,
  saveAvailabilityForDoctor,
} from '@/services/availabilityService';

const router = Router();

const weeklySlotSchema = z.object({
  day: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
});

const timeRangeSchema = z.object({
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
});

const dateOverrideSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  blocked: z.boolean(),
  slots: z.array(timeRangeSchema).optional(),
});

const saveAvailabilitySchema = z.object({
  weeklySchedule: z.array(weeklySlotSchema),
  dateOverrides: z.array(dateOverrideSchema),
  slotDurationMinutes: z.number().int().min(15).max(120),
  bufferMinutes: z.number().int().min(0).max(60),
  timezone: z.string().min(1),
  presetId: z.enum(['balanced', 'focused', 'extended']),
});

const slotsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

router.get('/me', requireAuth([UserRole.Doctor]), async (req: AuthenticatedRequest, res) => {
  try {
    const availability = await getAvailabilityForDoctor(req.user!.uid);
    res.json(availability);
  } catch (error) {
    console.error('Error fetching doctor availability', error);
    res.status(500).json({ message: 'Failed to load availability' });
  }
});

router.put('/me', requireAuth([UserRole.Doctor]), async (req: AuthenticatedRequest, res) => {
  const payload = validateBody(res, saveAvailabilitySchema, req.body, 'INVALID_AVAILABILITY');
  if (!payload) return;

  try {
    const dateOverrides = payload.dateOverrides.map((override) =>
      override.slots
        ? { ...override, slots: override.slots }
        : { date: override.date, blocked: override.blocked },
    );
    const saved = await saveAvailabilityForDoctor(req.user!.uid, {
      doctorId: req.user!.uid,
      updatedAt: new Date().toISOString(),
      ...payload,
      dateOverrides,
    });
    res.json(saved);
  } catch (error) {
    console.error('Error saving doctor availability', error);
    res.status(500).json({ message: 'Failed to save availability' });
  }
});

router.get('/:doctorId/slots', requireAuth([UserRole.Patient, UserRole.Doctor, UserRole.Admin]), async (req, res) => {
  const { doctorId } = req.params as { doctorId: string };
  const query = validateQuery(res, slotsQuerySchema, req.query, 'INVALID_QUERY');
  if (!query) return;

  try {
    const items = await getResolvedAvailabilityForDoctor(doctorId, query.date);
    res.json({ items });
  } catch (error) {
    console.error('Error resolving doctor availability', error);
    res.status(500).json({ message: 'Failed to load availability' });
  }
});

export default router;
