import { createPayPalOrder, capturePayPalOrder } from "@/network/paypalApiClient";

export async function startPayPalPayment(params: {
  appointmentId: string;
  amount: number;
  currency: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  const order = await createPayPalOrder(params);

  const approvalLink = order.links.find((l) => l.rel === "approve");
  if (!approvalLink) {
    throw new Error("No approval link returned from PayPal");
  }

  return {
    orderId: order.id,
    approvalUrl: approvalLink.href,
  };
}

export async function completePayPalPayment(orderId: string) {
  const captureResult = await capturePayPalOrder(orderId);

  // TODO: inspect captureResult.status and update appointment/payment status in domain if needed
  return captureResult;
}
