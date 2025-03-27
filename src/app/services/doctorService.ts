import { signRequest } from './apiService';

export const fetchDoctors = async () => {
  const path = '/api/doctors';
  const { signature, timestamp } = signRequest(path);

  const response = await fetch(path, {
    method: 'GET',
    headers: {
      'x-api-key': process.env.NEXT_PUBLIC_API_KEY!,
      'x-signature': signature,
      'x-timestamp': timestamp,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch doctors');
  }

  return response.json();
};
