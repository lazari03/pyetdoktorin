import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { appointmentId, amount } = req.body;

  if (!appointmentId || !amount) {
    return res.status(400).json({ error: "Missing required fields: appointmentId or amount" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2100, // Amount in cents (e.g., $50.00 = 5000)
      currency: "usd",
      metadata: { appointmentId },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch {
    res.status(500).json({ error: "Failed to create payment intent" });
  }
}