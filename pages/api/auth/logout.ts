import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const isProd = process.env.NODE_ENV === 'production';
  res.setHeader('Set-Cookie', [
    `session=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly${isProd ? '; Secure' : ''}`,
    `userRole=; Path=/; Max-Age=0; SameSite=Lax${isProd ? '; Secure' : ''}`,
    `lastActivity=; Path=/; Max-Age=0; SameSite=Lax${isProd ? '; Secure' : ''}`,
    `loggedIn=; Path=/; Max-Age=0; SameSite=Lax${isProd ? '; Secure' : ''}`,
  ]);

  return res.status(200).json({ ok: true });
}
