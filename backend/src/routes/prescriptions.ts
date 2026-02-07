import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { UserRole } from '@/domain/entities/UserRole';
import { createPrescription, listPrescriptionsForRole, updatePrescriptionStatus, getPrescriptionById } from '@/services/prescriptionsService';
import { buildDisplayName, getUserProfile } from '@/services/userProfileService';

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
  const [doctorProfile, patientProfile, pharmacyProfile] = await Promise.all([
    getUserProfile(user.uid),
    getUserProfile(patientId),
    pharmacyId ? getUserProfile(pharmacyId) : Promise.resolve(null),
  ]);
  const doctorDisplayName = buildDisplayName(doctorProfile, req.body.doctorName || 'Doctor');
  const patientDisplayName = buildDisplayName(patientProfile, patientName || 'Patient');
  const pharmacyDisplayName = pharmacyProfile?.pharmacyName ?? pharmacyName;
  const prescription = await createPrescription({
    doctorId: user.uid,
    doctorName: doctorDisplayName,
    patientId,
    patientName: patientDisplayName,
    pharmacyId,
    pharmacyName: pharmacyDisplayName,
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
  const user = (req as AuthenticatedRequest).user!;
  const prescription = await getPrescriptionById(id);
  if (!prescription) {
    return res.status(404).json({ error: 'Prescription not found' });
  }
  if (user.role === UserRole.Doctor && prescription.doctorId !== user.uid) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (user.role === UserRole.Pharmacy && prescription.pharmacyId !== user.uid) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  await updatePrescriptionStatus(id, status);
  res.json({ ok: true });
});

export default router;
