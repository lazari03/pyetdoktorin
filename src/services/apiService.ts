import crypto from 'crypto';

const SHARED_SECRET = process.env.NEXT_PUBLIC_SHARED_SECRET;

export const signRequest = (path: string): { signature: string; timestamp: string } => {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', SHARED_SECRET!)
    .update(`${timestamp}:${path}`)
    .digest('hex');

  return { signature, timestamp };
};
