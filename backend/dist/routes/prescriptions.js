"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const UserRole_1 = require("@/domain/entities/UserRole");
const prescriptionsService_1 = require("@/services/prescriptionsService");
const router = (0, express_1.Router)();
router.get('/', (0, auth_1.requireAuth)(), async (req, res) => {
    const user = req.user;
    const prescriptions = await (0, prescriptionsService_1.listPrescriptionsForRole)(user.uid, user.role);
    res.json({ items: prescriptions });
});
router.post('/', (0, auth_1.requireAuth)([UserRole_1.UserRole.Doctor]), async (req, res) => {
    const user = req.user;
    const { patientId, patientName, pharmacyId, pharmacyName, medicines, dosage, notes, title, signatureDataUrl, encrypted, encryptedNotes, encryptedSignature } = req.body || {};
    if (!patientId || !patientName || !Array.isArray(medicines) || medicines.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const prescription = await (0, prescriptionsService_1.createPrescription)({
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
router.patch('/:id/status', (0, auth_1.requireAuth)([UserRole_1.UserRole.Pharmacy, UserRole_1.UserRole.Doctor, UserRole_1.UserRole.Admin]), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!status) {
        return res.status(400).json({ error: 'Missing status' });
    }
    await (0, prescriptionsService_1.updatePrescriptionStatus)(id, status);
    res.json({ ok: true });
});
exports.default = router;
//# sourceMappingURL=prescriptions.js.map