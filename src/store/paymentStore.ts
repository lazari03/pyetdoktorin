import { create } from 'zustand';

interface PaymentState {
  paymentStatus: string | null;
  loading: boolean;
  error: string | null;
  processPayment: (paymentDetails: any) => Promise<void>;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  paymentStatus: null,
  loading: false,
  error: null,
  processPayment: async (paymentDetails) => {
    set({ loading: true, error: null });
    try {
      // Simulate payment processing logic
      await new Promise((resolve) => setTimeout(resolve, 2000));
      set({ paymentStatus: 'success', loading: false });
    } catch (error) {
      set({ error: 'Payment failed', loading: false });
    }
  },
}));
