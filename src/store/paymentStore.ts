import { create } from 'zustand';

interface PaymentDetails {
  amount: number;
  method: string;
  // Add other relevant fields as needed
}

interface PaymentState {
  paymentStatus: string | null;
  loading: boolean;
  error: string | null;
  processPayment: (paymentDetails: PaymentDetails) => Promise<void>; // Replaced 'any' with 'PaymentDetails'
}

export const usePaymentStore = create<PaymentState>((set) => ({
  paymentStatus: null,
  loading: false,
  error: null,
  processPayment: async () => { // Removed unused 'paymentDetails' parameter
    set({ loading: true, error: null });
    try {
      // Simulate payment processing logic
      await new Promise((resolve) => setTimeout(resolve, 2000));
      set({ paymentStatus: 'success', loading: false });
    } catch {
      set({ error: 'Payment failed', loading: false }); // Removed unused 'error' variable
    }
  },
}));
