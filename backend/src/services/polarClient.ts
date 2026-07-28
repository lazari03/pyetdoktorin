import { Polar } from '@polar-sh/sdk';
import { env } from '@/config/env';
import type { PresentmentCurrency } from '@polar-sh/sdk/dist/commonjs/models/components/presentmentcurrency';

export const polar = new Polar({
  accessToken: env.polarAccessToken,
  server: env.polarEnvironment,
});

const APPOINTMENT_PRODUCT_SLUG = 'appointment-consultation';

// ponytail: module-level cache, not persisted anywhere — fine since a
// process restart just re-runs the cheap "does it already exist" lookup
// below instead of creating a duplicate product.
let cachedAppointmentProductId: string | null = null;

/**
 * The doctor's actual fee is always passed as an ad-hoc `amount` override at
 * checkout-creation time, so this Product only exists because Polar's
 * checkout API requires one — it is never priced or configured per doctor.
 * Auto-created on first use (and reused via a metadata tag) so nobody has to
 * manually create a Product in the Polar dashboard and paste an ID into env.
 */
export async function getOrCreateAppointmentProductId(): Promise<string> {
  if (cachedAppointmentProductId) return cachedAppointmentProductId;

  const pages = await polar.products.list({
    metadata: { slug: APPOINTMENT_PRODUCT_SLUG },
    isArchived: false,
  });
  for await (const page of pages) {
    const existing = page.result.items[0];
    if (existing) {
      cachedAppointmentProductId = existing.id;
      return existing.id;
    }
    break;
  }

  const created = await polar.products.create({
    name: 'Appointment Consultation',
    metadata: { slug: APPOINTMENT_PRODUCT_SLUG },
    prices: [
      {
        amountType: 'fixed',
        priceAmount: Math.round(env.appointmentPriceEur * 100),
        priceCurrency: env.appointmentPriceCurrency.toLowerCase() as PresentmentCurrency,
      },
    ],
  });
  cachedAppointmentProductId = created.id;
  return created.id;
}

let cachedWebhookSecret: string | null = null;

/**
 * Manual `POLAR_WEBHOOK_SECRET` wins if set. Otherwise the backend registers
 * its own webhook endpoint with Polar (reusing one if it already created it
 * on a previous run) and uses the secret Polar generates for it — nobody has
 * to manually create a webhook endpoint in the dashboard either.
 */
export async function getOrCreateWebhookSecret(): Promise<string> {
  if (env.polarWebhookSecret) return env.polarWebhookSecret;
  if (cachedWebhookSecret) return cachedWebhookSecret;
  if (!env.backendPublicUrl) {
    throw new Error('Set POLAR_WEBHOOK_SECRET or BACKEND_PUBLIC_URL to receive Polar webhooks.');
  }

  const webhookUrl = `${env.backendPublicUrl.replace(/\/$/, '')}/api/polar/webhook`;

  const pages = await polar.webhooks.listWebhookEndpoints({});
  for await (const page of pages) {
    const existing = page.result.items.find((endpoint) => endpoint.url === webhookUrl);
    if (existing) {
      cachedWebhookSecret = existing.secret;
      return existing.secret;
    }
    break;
  }

  const created = await polar.webhooks.createWebhookEndpoint({
    url: webhookUrl,
    format: 'raw',
    events: ['order.paid'],
  });
  cachedWebhookSecret = created.secret;
  return created.secret;
}
