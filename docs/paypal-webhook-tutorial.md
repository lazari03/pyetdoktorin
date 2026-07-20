# PayPal webhook — how it works and how to set it up

## What this webhook actually does

When a patient pays, the primary flow is entirely synchronous:

1. Frontend calls `POST /api/paypal/create-order` → backend asks PayPal to create an order.
2. Patient approves the payment (PayPal button / login / card).
3. Frontend calls `POST /api/paypal/capture-order` → backend asks PayPal to capture the money, and marks the appointment paid **in that same request**.

The webhook is not part of that path — it's a backup. If step 3's response ever gets lost (server crash, network drop, browser tab closed a split second too early) after PayPal has *actually* charged the card, your database would never find out the payment succeeded. PayPal's webhook proactively calls **your backend** to say "this payment completed," so `backend/src/routes/paypal.ts`'s `POST /webhook` handler can mark the appointment paid anyway. It's safe to call twice — the same idempotency check used by `capture-order` (the `payments/{captureId}` ledger doc) makes sure it never double-processes.

You do **not** need this configured for payments to work. Skip it entirely until you're ready to harden the backup path.

## Requirement: a public HTTPS URL

PayPal has to reach your backend over the internet to deliver events. It **validates this at creation time** — it will flat-out reject `http://localhost:4000/...`, there's no way around that for local dev. Two options:

- **Local testing**: use a tunnel tool like `ngrok` to get a temporary public HTTPS URL pointing at your local backend.
- **Real deployment**: once your backend has a real domain (e.g. `https://api.pyetdoktorin.al`), use that.

## Option A — Create it yourself in the PayPal dashboard

1. Go to **developer.paypal.com**, log in.
2. Make sure the **Sandbox** toggle (top of the page) is selected — not Live.
3. **Apps & Credentials** → click into the app you got your Client ID/Secret from.
4. Scroll to the **Webhooks** section on that app's page → **Add Webhook**.
5. **Webhook URL**: `https://<your-public-url>/api/paypal/webhook`.
6. **Event types**: check **`PAYMENT.CAPTURE.COMPLETED`** (that's the only event this backend currently handles — extra selections are harmless, just ignored).
7. Save. PayPal shows you a **Webhook ID**.
8. Put it in `backend/.env`:
   ```
   PAYPAL_WEBHOOK_ID=<the id PayPal gave you>
   ```
9. Restart the backend.

## Option B — Create it via the API (what was done for you last time)

This is scriptable and doesn't require clicking through the dashboard. Three steps: get an access token, use it to register the webhook, save the returned ID.

```bash
# 1. Get an OAuth token using your Client ID/Secret (from backend/.env)
CLIENT_ID=<your PAYPAL_CLIENT_ID>
CLIENT_SECRET=<your PAYPAL_CLIENT_SECRET>
TOKEN=$(curl -s -X POST https://api-m.sandbox.paypal.com/v1/oauth2/token \
  -u "$CLIENT_ID:$CLIENT_SECRET" \
  -d "grant_type=client_credentials" \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")

# 2. Register the webhook against your public URL
curl -s -X POST https://api-m.sandbox.paypal.com/v1/notifications/webhooks \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "url": "https://<your-public-url>/api/paypal/webhook",
    "event_types": [{"name": "PAYMENT.CAPTURE.COMPLETED"}]
  }'
```

The response includes an `"id"` field — that's your `PAYPAL_WEBHOOK_ID`. Copy it into `backend/.env` and restart the backend.

To see webhooks you've already created (or check one still exists):
```bash
curl -s https://api-m.sandbox.paypal.com/v1/notifications/webhooks \
  -H "Authorization: Bearer $TOKEN"
```

To delete one (e.g. a stale ngrok URL that changed):
```bash
curl -s -X DELETE https://api-m.sandbox.paypal.com/v1/notifications/webhooks/<webhook-id> \
  -H "Authorization: Bearer $TOKEN"
```

Swap `api-m.sandbox.paypal.com` for `api-m.paypal.com` everywhere once you're doing this against a **live** app/credentials, not sandbox.

## Testing it locally with ngrok

```bash
ngrok http 4000
```

This prints a `https://<random-name>.ngrok-free.dev` URL forwarding to your local backend on port 4000. Use that as `<your-public-url>` above.

**Two things to know:**
- On ngrok's free tier, that URL **changes every time you restart the tunnel** — if that happens, delete the old webhook and create a new one with the new URL (Option B above makes this quick).
- This exposes your **entire local backend** to the internet for as long as the tunnel runs, not just the webhook route. Fine for active testing; kill it (`pkill ngrok`, or Ctrl+C the terminal it's running in) when you're done for the day.

## How to confirm it's actually working

1. In the PayPal dashboard, go back to your app's **Webhooks** section → click the webhook you created.
2. There's a **"Test event"** / event-simulation option — pick `PAYMENT.CAPTURE.COMPLETED` and send it.
3. Check your backend logs for a line like `POST /api/paypal/webhook` with a `200` status — that confirms PayPal successfully reached your server and the signature verification passed.

If you don't have a real payment to test end-to-end, this simulated event is the easiest way to confirm the wiring works before it matters for real.
