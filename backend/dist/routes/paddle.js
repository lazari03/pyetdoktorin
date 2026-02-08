"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_2 = __importDefault(require("express"));
const crypto_1 = __importDefault(require("crypto"));
const firebaseAdmin_1 = require("../config/firebaseAdmin");
const env_1 = require("../config/env");
const router = (0, express_1.Router)();
function parseSignature(header) {
    const parts = header.split(';').map((part) => part.trim());
    let timestamp = '';
    const signatures = [];
    for (const part of parts) {
        const [key, value = ''] = part.split('=');
        if (key === 'ts')
            timestamp = value;
        if (key === 'h1' && value)
            signatures.push(value);
    }
    return { timestamp, signatures };
}
function verifySignature(rawBody, header, secret) {
    const { timestamp, signatures } = parseSignature(header);
    if (!timestamp || signatures.length === 0)
        return false;
    const payload = `${timestamp}:${rawBody.toString('utf8')}`;
    const digest = crypto_1.default.createHmac('sha256', secret).update(payload).digest('hex');
    const digestBuf = Buffer.from(digest, 'hex');
    return signatures.some((sig) => {
        const sigBuf = Buffer.from(sig, 'hex');
        if (sigBuf.length !== digestBuf.length)
            return false;
        return crypto_1.default.timingSafeEqual(sigBuf, digestBuf);
    });
}
async function markAppointmentPaid(appointmentId, transactionId, status) {
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    const db = admin.firestore();
    await db.runTransaction(async (tx) => {
        const appointmentRef = db.collection('appointments').doc(appointmentId);
        const paymentRef = db.collection('payments').doc(transactionId);
        const [appointmentSnap, paymentSnap] = await Promise.all([
            tx.get(appointmentRef),
            tx.get(paymentRef),
        ]);
        if (!appointmentSnap.exists) {
            throw new Error('Appointment not found');
        }
        if (paymentSnap.exists) {
            return;
        }
        const appointment = appointmentSnap.data();
        if (appointment.isPaid) {
            if (appointment.transactionId === transactionId) {
                return;
            }
            return;
        }
        tx.set(paymentRef, {
            appointmentId,
            transactionId,
            status: status ?? 'paid',
            provider: 'paddle',
            createdAt: Date.now(),
        });
        tx.set(appointmentRef, {
            isPaid: true,
            paymentStatus: 'paid',
            transactionId,
            paymentProvider: 'paddle',
            paidAt: Date.now(),
        }, { merge: true });
    });
}
function respond(res, status, body) {
    return res.status(status).json(body);
}
router.post('/webhook', express_2.default.raw({ type: 'application/json' }), async (req, res) => {
    const secret = env_1.env.paddleWebhookSecret;
    if (!secret) {
        return respond(res, 500, { error: 'Missing Paddle webhook secret' });
    }
    const signature = req.header('Paddle-Signature') || '';
    if (!signature) {
        return respond(res, 401, { error: 'Missing Paddle signature' });
    }
    const rawBody = req.body;
    if (!Buffer.isBuffer(rawBody)) {
        return respond(res, 500, { error: 'Webhook body not available' });
    }
    const valid = verifySignature(rawBody, signature, secret);
    if (!valid) {
        return respond(res, 401, { error: 'Invalid Paddle signature' });
    }
    let event;
    try {
        event = JSON.parse(rawBody.toString('utf8'));
    }
    catch (error) {
        console.error('Invalid Paddle payload', error);
        return respond(res, 400, { error: 'Invalid payload' });
    }
    if (event.event_type === 'transaction.completed') {
        const data = event.data ?? {};
        const customData = data.custom_data
            ?? data.customData;
        const appointmentId = customData?.appointmentId ??
            customData?.appointment_id;
        const transactionId = data.id ?? data.transaction_id;
        if (!appointmentId || !transactionId) {
            return respond(res, 200, { ok: true });
        }
        try {
            await markAppointmentPaid(appointmentId, transactionId, data.status);
        }
        catch (error) {
            console.error('Paddle webhook error', error);
            return respond(res, 400, { error: 'Webhook processing failed' });
        }
    }
    return respond(res, 200, { ok: true });
});
exports.default = router;
//# sourceMappingURL=paddle.js.map