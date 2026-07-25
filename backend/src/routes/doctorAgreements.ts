import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { UserRole } from '@/domain/entities/UserRole';
import { DOCTOR_TERMS_VERSION, DOCTOR_TERMS_TITLE, DOCTOR_TERMS_PARAGRAPHS } from '@/content/doctorTermsContent';
import { submitAgreement, getAgreement, listAgreementSummaries } from '@/services/doctorAgreementsService';
import { renderDoctorAgreementPdf } from '@/services/pdf/doctorAgreementPdf';

const router = Router();

// Bounded to png/jpeg (the only formats the PDF renderer embeds) and capped
// well above what the client's compressed canvas export produces (~60KB) —
// rejects oversized or unexpected-format payloads at the API boundary
// instead of silently dropping them later in PDF generation.
const submitSchema = z.object({
  signatureDataUrl: z
    .string()
    .min(1)
    .max(100_000)
    .regex(/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/]+=*$/),
});

router.get('/terms', requireAuth(), async (_req, res) => {
  res.json({ version: DOCTOR_TERMS_VERSION, title: DOCTOR_TERMS_TITLE, paragraphs: DOCTOR_TERMS_PARAGRAPHS });
});

router.get('/me', requireAuth([UserRole.Doctor]), async (req: AuthenticatedRequest, res) => {
  try {
    const agreement = await getAgreement(req.user!.uid);
    if (!agreement) {
      return res.json({ signed: false });
    }
    res.json({ signed: true, ...agreement });
  } catch (error) {
    console.error('Error fetching doctor agreement:', error);
    res.status(500).json({ error: 'Failed to fetch agreement' });
  }
});

router.post('/', requireAuth([UserRole.Doctor]), async (req: AuthenticatedRequest, res) => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid signature', issues: parsed.error.issues });
  }
  try {
    const uid = req.user!.uid;
    const admin = getFirebaseAdmin();
    const [userDoc, authUser] = await Promise.all([
      admin.firestore().collection('users').doc(uid).get(),
      admin.auth().getUser(uid).catch(() => null),
    ]);
    const data = userDoc.data() ?? {};
    const doctorName = [data.name, data.surname].filter(Boolean).join(' ').trim() || authUser?.displayName || uid;
    const doctorEmail = (data.email as string | undefined) || authUser?.email || '';

    const agreement = await submitAgreement({
      doctorId: uid,
      doctorName,
      doctorEmail,
      signatureDataUrl: parsed.data.signatureDataUrl,
    });
    res.json({ signed: true, ...agreement });
  } catch (error) {
    console.error('Error submitting doctor agreement:', error);
    res.status(500).json({ error: 'Failed to submit agreement' });
  }
});

router.get('/', requireAuth([UserRole.Admin]), async (_req, res) => {
  try {
    const items = await listAgreementSummaries();
    res.json({ items });
  } catch (error) {
    console.error('Error listing doctor agreements:', error);
    res.status(500).json({ error: 'Failed to list agreements' });
  }
});

router.get('/:doctorId/pdf', requireAuth([UserRole.Admin]), async (req, res) => {
  const { doctorId } = req.params as { doctorId: string };
  try {
    const agreement = await getAgreement(doctorId);
    if (!agreement) {
      return res.status(404).json({ error: 'Agreement not found' });
    }
    // doctorId is a path param — never interpolate it into a header raw, even
    // though it's already gated by the getAgreement lookup above.
    const safeFilenamePart = doctorId.replace(/[^a-zA-Z0-9_-]/g, '');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="doctor-agreement-${safeFilenamePart}.pdf"`);
    const doc = renderDoctorAgreementPdf(agreement);
    doc.pipe(res);
  } catch (error) {
    console.error('Error generating doctor agreement PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

export default router;
