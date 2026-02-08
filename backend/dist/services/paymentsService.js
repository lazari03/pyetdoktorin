"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPayPalOrder = createPayPalOrder;
exports.capturePayPalOrder = capturePayPalOrder;
const env_1 = require("../config/env");
const firebaseAdmin_1 = require("../config/firebaseAdmin");
const appointmentsService_1 = require("../services/appointmentsService");
async function getPayPalAccessToken() {
    const credentials = Buffer.from(`${env_1.env.paypalClientId}:${env_1.env.paypalClientSecret}`).toString('base64');
    const response = await fetch(`${env_1.env.paypalApiBase}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`PayPal auth failed: ${text}`);
    }
    const data = await response.json();
    return data.access_token;
}
async function createPayPalOrder(amount, appointmentId) {
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`${env_1.env.paypalApiBase}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'USD',
                        value: amount.toFixed(2),
                    },
                    custom_id: appointmentId,
                },
            ],
        }),
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to create PayPal order: ${text}`);
    }
    return response.json();
}
async function capturePayPalOrder(orderId, appointmentId) {
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`${env_1.env.paypalApiBase}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to capture PayPal order: ${text}`);
    }
    const data = await response.json();
    const captureId = data.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    if (!captureId) {
        throw new Error('Missing capture ID');
    }
    await (0, appointmentsService_1.markAppointmentPaid)(appointmentId, captureId);
    const admin = (0, firebaseAdmin_1.getFirebaseAdmin)();
    await admin.firestore().collection('payments').add({
        appointmentId,
        orderId,
        captureId,
        status: 'COMPLETED',
        createdAt: Date.now(),
    });
    return data;
}
//# sourceMappingURL=paymentsService.js.map