import { backendFetch } from '@/network/backendClient';

export type DoctorPayoutSummary = {
  doctorId: string;
  doctorName: string;
  currency: string;
  totalAmount: number;
  payoutAmount: number;
  platformFee: number;
  pendingAmount: number;
  pendingCount: number;
  paidAmount: number;
  paidCount: number;
};

export type PayoutSummaryResponse = {
  doctorPayoutPercentage: number;
  currency: string;
  totals: {
    totalAmount: number;
    payoutAmount: number;
    platformFee: number;
    pendingAmount: number;
    paidAmount: number;
  };
  doctors: DoctorPayoutSummary[];
};

export async function fetchPayoutSummary() {
  return backendFetch<PayoutSummaryResponse>('/api/payouts/summary');
}

export async function markDoctorPayoutsPaid(doctorId: string) {
  return backendFetch<{ ok: boolean; updated: number }>('/api/payouts/mark-paid', {
    method: 'POST',
    body: JSON.stringify({ doctorId }),
  });
}
