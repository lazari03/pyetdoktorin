"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const UserRole_1 = require("../domain/entities/UserRole");
const appointmentsService_1 = require("../services/appointmentsService");
const userProfileService_1 = require("../services/userProfileService");
const router = (0, express_1.Router)();
router.get('/', (0, auth_1.requireAuth)(), async (req, res) => {
    const user = req.user;
    const appointments = await (0, appointmentsService_1.listAppointmentsForUser)(user.uid, user.role);
    res.json({ items: appointments });
});
router.post('/', (0, auth_1.requireAuth)([UserRole_1.UserRole.Patient]), async (req, res) => {
    const user = req.user;
    const { doctorId, doctorName, appointmentType, preferredDate, preferredTime, note, notes } = req.body || {};
    if (!doctorId || !doctorName || !preferredDate) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const [patientProfile, doctorProfile] = await Promise.all([
        (0, userProfileService_1.getUserProfile)(user.uid),
        (0, userProfileService_1.getUserProfile)(doctorId),
    ]);
    const patientDisplayName = (0, userProfileService_1.buildDisplayName)(patientProfile, 'Patient');
    const doctorDisplayName = (0, userProfileService_1.buildDisplayName)(doctorProfile, doctorName || 'Doctor');
    const appointment = await (0, appointmentsService_1.createAppointment)({
        patientId: user.uid,
        patientName: patientDisplayName,
        doctorId,
        doctorName: doctorDisplayName,
        appointmentType,
        preferredDate,
        preferredTime,
        note,
        notes,
    });
    res.status(201).json(appointment);
});
router.patch('/:id/status', (0, auth_1.requireAuth)([UserRole_1.UserRole.Doctor, UserRole_1.UserRole.Admin]), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!status) {
        return res.status(400).json({ error: 'Missing status' });
    }
    const appointment = await (0, appointmentsService_1.getAppointmentById)(id);
    if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
    }
    if (req.user.role === UserRole_1.UserRole.Doctor && appointment.doctorId !== req.user.uid) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    await (0, appointmentsService_1.updateAppointmentStatus)(id, status, req.user.role);
    res.json({ ok: true });
});
router.get('/:id', (0, auth_1.requireAuth)(), async (req, res) => {
    const { id } = req.params;
    const appointment = await (0, appointmentsService_1.getAppointmentById)(id);
    if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
    }
    const user = req.user;
    if (user.role !== UserRole_1.UserRole.Admin && appointment.patientId !== user.uid && appointment.doctorId !== user.uid) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(appointment);
});
exports.default = router;
//# sourceMappingURL=appointments.js.map