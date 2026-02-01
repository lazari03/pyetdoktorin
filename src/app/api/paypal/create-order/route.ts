import { NextRequest, NextResponse } from "next/server";
import { startPayPalPayment } from "@/infrastructure/services/paypalPaymentService";

export async function POST(req: NextRequest) {
  try {
    const { appointmentId } = await req.json();
    if (!appointmentId) {
      return NextResponse.json(
        { error: "Missing appointmentId" },
        { status: 400 }
      );
    }

    const origin = req.nextUrl.origin || req.headers.get("origin") || "";
    const amount = Number(process.env.PAYWALL_AMOUNT_USD ?? process.env.NEXT_PUBLIC_PAYWALL_AMOUNT_USD ?? 13);
    const currency = "USD";
    const returnUrl = `${origin}/dashboard/appointments?paypal=success&appointmentId=${appointmentId}`;
    const cancelUrl = `${origin}/dashboard/appointments?paypal=cancel&appointmentId=${appointmentId}`;

    const { orderId, approvalUrl } = await startPayPalPayment({
      appointmentId,
      amount,
      currency,
      returnUrl,
      cancelUrl,
    });

    return NextResponse.json({ orderId, approvalUrl });
  } catch (err) {
    console.error("PayPal create-order error", err);
    return NextResponse.json(
      { error: "Failed to create PayPal order" },
      { status: 500 }
    );
  }
}
