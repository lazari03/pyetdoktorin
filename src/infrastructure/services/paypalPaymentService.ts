interface PayPalPaymentParams {
  appointmentId: string;
  amount: number;
  currency: string;
  returnUrl: string;
  cancelUrl: string;
}

interface PayPalOrderResponse {
  orderId: string;
  approvalUrl: string;
}

const PAYPAL_ENV = process.env.PAYPAL_ENV || 'sandbox';
const PAYPAL_API_BASE =
  process.env.PAYPAL_API_BASE ||
  (PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com');
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token');
  }

  const data = await response.json();
  return data.access_token;
}

export async function startPayPalPayment(params: PayPalPaymentParams): Promise<PayPalOrderResponse> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: params.appointmentId,
        amount: {
          currency_code: params.currency,
          value: params.amount.toFixed(2),
        },
      }],
      application_context: {
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create PayPal order: ${error}`);
  }

  const data = await response.json();
  const approvalLink = data.links?.find((link: { rel: string }) => link.rel === 'approve');

  return {
    orderId: data.id,
    approvalUrl: approvalLink?.href || '',
  };
}

export async function completePayPalPayment(orderId: string): Promise<{ status: string; appointmentId?: string }> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to capture PayPal order: ${error}`);
  }

  const data = await response.json();
  const appointmentId = data.purchase_units?.[0]?.reference_id;

  return {
    status: data.status,
    appointmentId,
  };
}
