import type { NextApiRequest, NextApiResponse } from 'next';
import { connectService } from '@/core/application/services/useCases/connectService';
import { serviceConnector, serviceRepository } from '@/core/infrastructure/services';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { serviceId } = req.body as { serviceId?: string };

  try {
    const service = await connectService(serviceId || '', serviceRepository, serviceConnector);
    return res.status(200).json({ service });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
}
