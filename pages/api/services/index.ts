import type { NextApiRequest, NextApiResponse } from 'next';
import { listConnectedServices } from '@/core/application/services/useCases/listConnectedServices';
import { serviceRepository } from '@/core/infrastructure/services';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const services = await listConnectedServices(serviceRepository);
  return res.status(200).json({ services });
}
