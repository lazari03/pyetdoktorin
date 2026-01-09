import { NextRequest, NextResponse } from "next/server";
import { completePayPalPayment } from "@/domain/paypalPaymentService";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing orderId" },
        { status: 400 }
      );
    }

    const result = await completePayPalPayment(orderId);

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("PayPal capture-order error", err);
    return NextResponse.json(
      { error: "Failed to capture PayPal order" },
      { status: 500 }
    );
  }
}
