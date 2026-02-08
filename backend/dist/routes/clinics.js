"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const clinics_1 = require("../data/clinics");
const clinicBookingsService_1 = require("../services/clinicBookingsService");
const UserRole_1 = require("../domain/entities/UserRole");
const userProfileService_1 = require("../services/userProfileService");
const firebaseAdmin_1 = require("../config/firebaseAdmin");
const router = (0, express_1.Router)();
router.get('/catalog', (_req, res) => {
    res.json({ items: clinics_1.clinicsCatalog });
});
router.get('/private', (0, auth_1.requireAuth)([UserRole_1.UserRole.Patient, UserRole_1.UserRole.Admin]), async (_req, res) => {
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    const snapshot = await admin.firestore().collection('users').where('role', '==', UserRole_1.UserRole.Clinic).get();
    const items = snapshot.docs.map((doc) => {
        const data = doc.data();
        const clinicName = data.clinicName ?? '';
        const name = clinicName || `${data.name ?? ''} ${data.surname ?? ''}`.trim() || 'Clinic';
        const specialization = data.specialization;
        const specializations = Array.isArray(data.specializations) ? data.specializations : [];
        const specialties = specializations.length > 0 ? specializations : (specialization ? [specialization] : []);
        return {
            id: doc.id,
            name,
            address: data.address ?? '',
            description: data.bio ?? data.about ?? '',
            specialties,
            phone: data.phone ?? '',
            email: data.email ?? '',
            imageUrl: data.imageUrl ?? undefined,
        };
    });
    res.json({ items });
});
router.get('/bookings', (0, auth_1.requireAuth)(), async (req, res) => {
    const user = req.user;
    if (user.role === UserRole_1.UserRole.Admin) {
        const { clinicId, patientId } = req.query;
        if (patientId) {
            const items = await (0, clinicBookingsService_1.listBookingsByPatient)(patientId);
            return res.json({ items });
        }
        if (clinicId) {
            const items = await (0, clinicBookingsService_1.listBookingsByClinic)(clinicId);
            return res.json({ items });
        }
        const items = await (0, clinicBookingsService_1.listAllBookings)();
        return res.json({ items });
    }
    if (user.role === UserRole_1.UserRole.Clinic) {
        const items = await (0, clinicBookingsService_1.listBookingsByClinic)(user.uid);
        return res.json({ items });
    }
    const items = await (0, clinicBookingsService_1.listBookingsByPatient)(user.uid);
    return res.json({ items });
});
router.post('/bookings', (0, auth_1.requireAuth)([UserRole_1.UserRole.Patient]), async (req, res) => {
    const user = req.user;
    const { clinicId, clinicName, note, preferredDate } = req.body || {};
    if (!clinicId || !clinicName || !note) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const patientProfile = await (0, userProfileService_1.getUserProfile)(user.uid);
    const patientName = (0, userProfileService_1.buildDisplayName)(patientProfile, req.body.patientName || 'Patient');
    const patientEmail = patientProfile?.email ?? req.body.patientEmail ?? '';
    const patientPhone = patientProfile?.phone ?? req.body.patientPhone;
    const booking = await (0, clinicBookingsService_1.createClinicBooking)({
        clinicId,
        clinicName,
        patientId: user.uid,
        patientName,
        patientEmail,
        patientPhone,
        note,
        preferredDate,
    });
    res.status(201).json(booking);
});
router.patch('/bookings/:id/status', (0, auth_1.requireAuth)([UserRole_1.UserRole.Admin, UserRole_1.UserRole.Clinic]), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!status) {
        return res.status(400).json({ error: 'Missing status' });
    }
    const user = req.user;
    const booking = await (0, clinicBookingsService_1.getClinicBookingById)(id);
    if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
    }
    if (user.role === UserRole_1.UserRole.Clinic && booking.clinicId !== user.uid) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    await (0, clinicBookingsService_1.updateClinicBookingStatus)(id, status);
    res.json({ ok: true });
});
exports.default = router;
//# sourceMappingURL=clinics.js.map