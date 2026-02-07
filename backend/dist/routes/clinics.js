"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const clinics_1 = require("@/data/clinics");
const clinicBookingsService_1 = require("@/services/clinicBookingsService");
const UserRole_1 = require("@/domain/entities/UserRole");
const router = (0, express_1.Router)();
router.get('/catalog', (_req, res) => {
    res.json({ items: clinics_1.clinicsCatalog });
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
    const booking = await (0, clinicBookingsService_1.createClinicBooking)({
        clinicId,
        clinicName,
        patientId: user.uid,
        patientName: req.body.patientName || 'Patient',
        patientEmail: req.body.patientEmail || '',
        patientPhone: req.body.patientPhone,
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
    await (0, clinicBookingsService_1.updateClinicBookingStatus)(id, status);
    res.json({ ok: true });
});
exports.default = router;
//# sourceMappingURL=clinics.js.map