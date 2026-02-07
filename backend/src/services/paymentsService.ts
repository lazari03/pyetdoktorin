import { env } from '@/config/env';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { markAppointmentPaid } from '@/services/appointmentsService';

async function getPayPalAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${env.paypalClientId}:${env.paypalClientSecret}`).toString('base64');
  const response = await fetch(`${env.paypalApiBase}/v1/oauth2/token`, {
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
  return data.access_token as string;
}

export async function createPayPalOrder(amount: number, appointmentId: string) {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${env.paypalApiBase}/v2/checkout/orders`, {
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

export async function capturePayPalOrder(orderId: string, appointmentId: string) {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${env.paypalApiBase}/v2/checkout/orders/${orderId}/capture`, {
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
  await markAppointmentPaid(appointmentId, captureId);
  const admin = getFirebaseAdmin();
  await admin.firestore().collection('payments').add({
    appointmentId,
    orderId,
    captureId,
    status: 'COMPLETED',
    createdAt: Date.now(),
  });
  return data;
}
