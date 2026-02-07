import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { UserRole } from '@/domain/entities/UserRole';
import { createPrescription, listPrescriptionsForRole, updatePrescriptionStatus } from '@/services/prescriptionsService';

const router = Router();

router.get('/', requireAuth(), async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const prescriptions = await listPrescriptionsForRole(user.uid, user.role);
  res.json({ items: prescriptions });
});

router.post('/', requireAuth([UserRole.Doctor]), async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { patientId, patientName, pharmacyId, pharmacyName, medicines, dosage, notes, title, signatureDataUrl, encrypted, encryptedNotes, encryptedSignature } = req.body || {};
  if (!patientId || !patientName || !Array.isArray(medicines) || medicines.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const prescription = await createPrescription({
    doctorId: user.uid,
    doctorName: req.body.doctorName || 'Doctor',
    patientId,
    patientName,
    pharmacyId,
    pharmacyName,
    medicines,
    dosage,
    notes,
    title,
    signatureDataUrl,
    encrypted,
    encryptedNotes,
    encryptedSignature,
  });
  res.status(201).json(prescription);
});

router.patch('/:id/status', requireAuth([UserRole.Pharmacy, UserRole.Doctor, UserRole.Admin]), async (req, res) => {
  const { id } = req.params as { id: string };
  const { status } = req.body || {};
  if (!status) {
    return res.status(400).json({ error: 'Missing status' });
  }
  await updatePrescriptionStatus(id, status);
  res.json({ ok: true });
});

export default router;
