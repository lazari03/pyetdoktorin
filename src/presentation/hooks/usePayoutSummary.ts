import useSWR from 'swr';
import { fetchPayoutSummary } from '@/network/payouts';

export function usePayoutSummary() {
  return useSWR('admin-payout-summary', fetchPayoutSummary);
}
