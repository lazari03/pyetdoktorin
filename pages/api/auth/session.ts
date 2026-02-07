import type { NextApiRequest, NextApiResponse } from 'next';
import { setSecurityHeaders } from '../../../src/config/httpHeaders';
import { EstablishSessionUseCase } from '@/application/auth/EstablishSessionUseCase';
import { FirebaseServerSessionService } from '@/infrastructure/services/serverSessionService';
import { SessionException } from '@/application/errors/SessionException';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { idToken } = req.body || {};
    if (!idToken) {
      return res.status(400).json({ error: 'Missing idToken' });
    }

    const sessionService = new FirebaseServerSessionService(IS_PRODUCTION);
    const establishSession = new EstablishSessionUseCase(sessionService);
    const result = await establishSession.execute(idToken);
    setSecurityHeaders(res, IS_PRODUCTION);
    res.setHeader('Set-Cookie', result.cookies);

    return res.status(200).json({ ok: true });
  } catch (e: unknown) {
    if (e instanceof SessionException) {
      return res.status(e.status).json({ error: e.message });
    }
    console.error('Session API error:', e);
    const message = e instanceof Error ? e.message : 'Internal error';
    return res.status(500).json({ error: message });
  }
}
