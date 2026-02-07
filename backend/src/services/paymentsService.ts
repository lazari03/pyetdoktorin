import { env } from '@/config/env';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';

type PayPalOrder = {
  status?: string;
  purchase_units?: Array<{
    custom_id?: string;
    amount?: {
      currency_code?: string;
      value?: string;
    };
  }>;
};

function normalizeAmount(amount: number): string {
  return amount.toFixed(2);
}

function assertOrderMatches(order: PayPalOrder, appointmentId: string, expectedAmount: number) {
  const unit = order.purchase_units?.[0];
  const orderAmount = unit?.amount?.value;
  const orderCurrency = unit?.amount?.currency_code;
  const orderAppointmentId = unit?.custom_id;
  if (!unit || !orderAmount || !orderCurrency || !orderAppointmentId) {
    throw new Error('Invalid PayPal order payload');
  }
  if (orderAppointmentId !== appointmentId) {
    throw new Error('PayPal order does not match appointment');
  }
  if (orderCurrency !== 'USD') {
    throw new Error('Unexpected PayPal currency');
  }
  if (orderAmount !== normalizeAmount(expectedAmount)) {
    throw new Error('Unexpected PayPal amount');
  }
}

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

async function getPayPalOrder(orderId: string, accessToken: string): Promise<PayPalOrder> {
  const response = await fetch(`${env.paypalApiBase}/v2/checkout/orders/${orderId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch PayPal order: ${text}`);
  }
  return response.json();
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

export async function capturePayPalOrder(orderId: string, appointmentId: string, expectedAmount: number) {
  const accessToken = await getPayPalAccessToken();
  const order = await getPayPalOrder(orderId, accessToken);
  assertOrderMatches(order, appointmentId, expectedAmount);
  if (order.status && !['APPROVED', 'COMPLETED'].includes(order.status)) {
    throw new Error(`PayPal order not approved: ${order.status}`);
  }
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
  const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
  const captureId = capture?.id;
  const captureStatus = capture?.status;
  if (!captureId) {
    throw new Error('Missing capture ID');
  }
  if (captureStatus && captureStatus !== 'COMPLETED') {
    throw new Error(`Payment not completed: ${captureStatus}`);
  }

  const admin = getFirebaseAdmin();
  const db = admin.firestore();
  await db.runTransaction(async (tx) => {
    const appointmentRef = db.collection('appointments').doc(appointmentId);
    const paymentRef = db.collection('payments').doc(orderId);
    const [appointmentSnap, paymentSnap] = await Promise.all([
      tx.get(appointmentRef),
      tx.get(paymentRef),
    ]);
    if (!appointmentSnap.exists) {
      throw new Error('Appointment not found');
    }
    const appointment = appointmentSnap.data() as { isPaid?: boolean; transactionId?: string };
    if (paymentSnap.exists) {
      const payment = paymentSnap.data() as { appointmentId?: string; captureId?: string };
      if (payment.appointmentId !== appointmentId) {
        throw new Error('PayPal order already used for another appointment');
      }
      if (appointment.isPaid && appointment.transactionId === payment.captureId) {
        return;
      }
      throw new Error('PayPal order already processed');
    }
    if (appointment.isPaid) {
      throw new Error('Appointment already paid');
    }
    tx.set(paymentRef, {
      appointmentId,
      orderId,
      captureId,
      status: captureStatus ?? 'COMPLETED',
      createdAt: Date.now(),
    });
    tx.set(appointmentRef, {
      isPaid: true,
      paymentStatus: 'paid',
      transactionId: captureId,
      paidAt: Date.now(),
    }, { merge: true });
  });
  return data;
}
