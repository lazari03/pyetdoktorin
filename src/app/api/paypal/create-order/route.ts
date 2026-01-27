import { NextRequest, NextResponse } from "next/server";
import { startPayPalPayment } from "@/infrastructure/services/paypalPaymentService";

export async function POST(req: NextRequest) {
  try {
    const { appointmentId, amount, currency, returnUrl, cancelUrl } =
      await req.json();

    if (!appointmentId || !amount || !currency || !returnUrl || !cancelUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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
