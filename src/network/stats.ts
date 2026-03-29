import { backendFetch } from './backendClient';
import type { User } from '@/domain/entities/User';

export type TopDoctorMetric = 'appointments' | 'requests';

type TopDoctor = {
  doctor: User & { name?: string; surname?: string };
  count: number;
};

type TopDoctorsResponse = {
  metric: TopDoctorMetric;
  items: TopDoctor[];
};

export async function fetchTopDoctors(metric: TopDoctorMetric, limit = 5) {
  const query = new URLSearchParams({
    metric,
    limit: String(limit),
  });
  return backendFetch<TopDoctorsResponse>(`/api/stats/admin/top-doctors?${query.toString()}`);
}
