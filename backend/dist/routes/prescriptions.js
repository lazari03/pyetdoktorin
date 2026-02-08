"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const UserRole_1 = require("../domain/entities/UserRole");
const prescriptionsService_1 = require("../services/prescriptionsService");
const userProfileService_1 = require("../services/userProfileService");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const createPrescriptionSchema = zod_1.z.object({
    patientId: zod_1.z.string().min(1),
    patientName: zod_1.z.string().min(1),
    pharmacyId: zod_1.z.string().optional(),
    pharmacyName: zod_1.z.string().optional(),
    medicines: zod_1.z.array(zod_1.z.string().min(1)).min(1),
    dosage: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    title: zod_1.z.string().optional(),
    signatureDataUrl: zod_1.z.string().optional(),
    doctorName: zod_1.z.string().optional(),
}).strict();
router.get('/', (0, auth_1.requireAuth)(), async (req, res) => {
    const user = req.user;
    const prescriptions = await (0, prescriptionsService_1.listPrescriptionsForRole)(user.uid, user.role);
    res.json({ items: prescriptions });
});
router.post('/', (0, auth_1.requireAuth)([UserRole_1.UserRole.Doctor]), async (req, res) => {
    const user = req.user;
    const parsed = createPrescriptionSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });
    }
    const { patientId, patientName, pharmacyId, pharmacyName, medicines, dosage, notes, title, signatureDataUrl, doctorName } = parsed.data;
    if (!patientId || !patientName || !Array.isArray(medicines) || medicines.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const [doctorProfile, patientProfile, pharmacyProfile] = await Promise.all([
        (0, userProfileService_1.getUserProfile)(user.uid),
        (0, userProfileService_1.getUserProfile)(patientId),
        pharmacyId ? (0, userProfileService_1.getUserProfile)(pharmacyId) : Promise.resolve(null),
    ]);
    const doctorDisplayName = (0, userProfileService_1.buildDisplayName)(doctorProfile, doctorName || 'Doctor');
    const patientDisplayName = (0, userProfileService_1.buildDisplayName)(patientProfile, patientName || 'Patient');
    const pharmacyDisplayName = pharmacyProfile?.pharmacyName ?? pharmacyName;
    const payload = {
        doctorId: user.uid,
        doctorName: doctorDisplayName,
        patientId,
        patientName: patientDisplayName,
        medicines,
        ...(pharmacyId !== undefined ? { pharmacyId } : {}),
        ...(pharmacyDisplayName !== undefined ? { pharmacyName: pharmacyDisplayName } : {}),
        ...(dosage !== undefined ? { dosage } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(title !== undefined ? { title } : {}),
        ...(signatureDataUrl !== undefined ? { signatureDataUrl } : {}),
    };
    const prescription = await (0, prescriptionsService_1.createPrescription)(payload);
    res.status(201).json(prescription);
});
router.patch('/:id/status', (0, auth_1.requireAuth)([UserRole_1.UserRole.Pharmacy, UserRole_1.UserRole.Doctor, UserRole_1.UserRole.Admin]), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!status) {
        return res.status(400).json({ error: 'Missing status' });
    }
    const user = req.user;
    const prescription = await (0, prescriptionsService_1.getPrescriptionById)(id);
    if (!prescription) {
        return res.status(404).json({ error: 'Prescription not found' });
    }
    if (user.role === UserRole_1.UserRole.Doctor && prescription.doctorId !== user.uid) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    if (user.role === UserRole_1.UserRole.Pharmacy && prescription.pharmacyId !== user.uid) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    await (0, prescriptionsService_1.updatePrescriptionStatus)(id, status);
    res.json({ ok: true });
});
exports.default = router;
//# sourceMappingURL=prescriptions.js.map