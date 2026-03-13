import { backendFetch } from '@/network/backendClient';
import { Doctor } from '@/domain/entities/Doctor';
import { SearchType } from '@/models/FirestoreConstants';

export async function getDoctorById(doctorId: string): Promise<Doctor | null> {
  try {
    return await backendFetch<Doctor>(`/api/doctors/${encodeURIComponent(doctorId)}`);
  } catch {
    return null;
  }
}

export async function fetchDoctors(searchTerm: string, searchType: SearchType): Promise<Doctor[]> {
  try {
    if (!searchTerm.trim()) {
      return [];
    }
    const params = new URLSearchParams({
      q: searchTerm.trim(),
      type: searchType,
    });
    const response = await backendFetch<{ items: Doctor[] }>(`/api/doctors?${params.toString()}`);
    return response.items;
  } catch {
    throw new Error('Failed to fetch doctors');
  }
}
