import { apiClient } from './apiClient';

export async function logoutApi(): Promise<{ status: number }> {
  const { status } = await apiClient.post('/api/auth/logout');
  return { status };
}
