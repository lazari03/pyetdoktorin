"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const UserRole_1 = require("@/domain/entities/UserRole");
const paymentsService_1 = require("@/services/paymentsService");
const appointmentsService_1 = require("@/services/appointmentsService");
const router = (0, express_1.Router)();
const PAYWALL_AMOUNT = Number(process.env.NEXT_PUBLIC_PAYWALL_AMOUNT_USD || 13);
router.post('/create-order', (0, auth_1.requireAuth)([UserRole_1.UserRole.Patient]), async (req, res) => {
    const { appointmentId } = req.body || {};
    if (!appointmentId) {
        return res.status(400).json({ error: 'Missing appointmentId' });
    }
    const appointment = await (0, appointmentsService_1.getAppointmentById)(appointmentId);
    if (!appointment || appointment.patientId !== req.user.uid) {
        return res.status(404).json({ error: 'Appointment not found' });
    }
    const order = await (0, paymentsService_1.createPayPalOrder)(PAYWALL_AMOUNT, appointmentId);
    res.json(order);
});
router.post('/capture-order', (0, auth_1.requireAuth)([UserRole_1.UserRole.Patient]), async (req, res) => {
    const { orderId, appointmentId } = req.body || {};
    if (!orderId || !appointmentId) {
        return res.status(400).json({ error: 'Missing orderId or appointmentId' });
    }
    const appointment = await (0, appointmentsService_1.getAppointmentById)(appointmentId);
    if (!appointment || appointment.patientId !== req.user.uid) {
        return res.status(404).json({ error: 'Appointment not found' });
    }
    const capture = await (0, paymentsService_1.capturePayPalOrder)(orderId, appointmentId);
    res.json(capture);
});
exports.default = router;
//# sourceMappingURL=payments.js.map