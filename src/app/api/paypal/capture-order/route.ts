import { NextRequest, NextResponse } from "next/server";
import { completePayPalPayment } from "@/infrastructure/services/paypalPaymentService";
import { getAdmin } from "../../_lib/admin";

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

    if (result.status === "COMPLETED" && result.appointmentId) {
      const { db } = getAdmin();
      await db
        .collection("appointments")
        .doc(result.appointmentId)
        .set(
          {
            isPaid: true,
            paymentStatus: "paid",
            transactionId: result.captureId,
            paidAt: new Date().toISOString(),
          },
          { merge: true }
        );

      await db.collection("payments").add({
        appointmentId: result.appointmentId,
        transactionId: result.captureId,
        status: result.status,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("PayPal capture-order error", err);
    return NextResponse.json(
      { error: "Failed to capture PayPal order" },
      { status: 500 }
    );
  }
}
