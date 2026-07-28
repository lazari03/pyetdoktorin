// This project's `moduleResolution: "node"` can't resolve @polar-sh/sdk's
// subpath `exports` map for type-checking (Node's own require() at runtime
// handles it fine) — this ambient declaration just gives the compiler a
// shape for the one subpath we import from directly.
declare module '@polar-sh/sdk/webhooks' {
  export interface PolarWebhookEvent {
    type: string;
    timestamp: Date;
    data: {
      id: string;
      status?: string;
      metadata?: Record<string, string | number | boolean>;
      [key: string]: unknown;
    };
  }

  export function validateEvent(
    body: string | Buffer,
    headers: Record<string, string>,
    secret: string,
  ): PolarWebhookEvent;

  export class WebhookVerificationError extends Error {}
}
