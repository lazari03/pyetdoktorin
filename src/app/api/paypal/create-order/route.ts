import { NextRequest, NextResponse } from "next/server";
import { startPayPalPayment } from "@/infrastructure/services/paypalPaymentService";
import { getAdmin } from "../../_lib/admin";

export async function POST(req: NextRequest) {
  try {
    const { appointmentId, patientId } = await req.json();
    if (!appointmentId || !patientId) {
      return NextResponse.json(
        { error: "Missing appointmentId or patientId" },
        { status: 400 }
      );
    }

    // Validate appointment ownership and unpaid status
    const { db } = getAdmin();
    const snap = await db.collection("appointments").doc(appointmentId).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }
    const appt = snap.data() || {};
    if (appt.patientId !== patientId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (appt.isPaid) {
      return NextResponse.json({ error: "Already paid" }, { status: 409 });
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
