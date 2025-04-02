import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia", // Use the required API version
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { session_id } = req.query;

  if (!session_id) {
    console.error("Missing session_id in request");
    return res.status(400).json({ error: "Missing session_id" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id as string);
    console.log("Stripe session retrieved:", session);

    if (session.payment_status === "paid") {
      const appointmentId = session.metadata?.appointmentId;
      console.log("Payment successful for appointmentId:", appointmentId);
      return res.status(200).json({ appointmentId });
    } else {
      console.log("Payment not completed. Payment status:", session.payment_status);
      return res.status(400).json({ error: "Payment not completed" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Failed to verify payment", details: (error as Error).message });
  }
}