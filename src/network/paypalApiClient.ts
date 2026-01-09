import axios from "axios";

const PAYPAL_API_BASE =
  process.env.PAYPAL_API_BASE ?? "https://api-m.sandbox.paypal.com";

function getBasicAuthHeader(): string {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing PayPal client credentials");
  }

  const token = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  return `Basic ${token}`;
}

async function getAccessToken(): Promise<string> {
  const res = await axios.post(
    `${PAYPAL_API_BASE}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: getBasicAuthHeader(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return res.data.access_token as string;
}

export async function createPayPalOrder(params: {
  amount: number;
  currency: string;
  appointmentId: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  const accessToken = await getAccessToken();

  const res = await axios.post(
    `${PAYPAL_API_BASE}/v2/checkout/orders`,
    {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.appointmentId,
          amount: {
            currency_code: params.currency,
            value: params.amount.toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data as {
    id: string;
    status: string;
    links: { href: string; rel: string; method: string }[];
  };
}

export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getAccessToken();

  const res = await axios.post(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data;
}
