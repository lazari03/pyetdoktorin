import type { NextApiRequest, NextApiResponse } from 'next';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { IncomingForm, type Files, type Fields } from 'formidable';
import fs from 'fs/promises';
import { getAdmin } from '@/app/api/_lib/admin';

// Disable default body parsing to handle FormData
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to check env vars
function requireEnv(name: string): string | null {
  const value = process.env[name];
  if (!value) return null;
  return value;
}

// Configure AWS SDK for DigitalOcean Spaces
function createS3Client(region: string, accessKey: string, secretKey: string) {
  const endpoint = `${region}.digitaloceanspaces.com`;
  const spacesEndpoint = new AWS.Endpoint(endpoint);
  return new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
    region,
    signatureVersion: 'v4',
  });
}

function parseForm(req: NextApiRequest) {
  const form = new IncomingForm({
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
    keepExtensions: true,
  });
  return new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX = 10;
const rateLimit = new Map<string, number[]>();

function getBearerToken(req: NextApiRequest) {
  const header = req.headers.authorization;
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function getClientKey(req: NextApiRequest, uid?: string) {
  const xfwd = req.headers['x-forwarded-for'];
  const ip = Array.isArray(xfwd) ? xfwd[0] : xfwd?.split(',')[0]?.trim();
  return uid ? `uid:${uid}` : ip ? `ip:${ip}` : 'unknown';
}

function isRateLimited(key: string) {
  const now = Date.now();
  const existing = rateLimit.get(key) ?? [];
  const recent = existing.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimit.set(key, recent);
    return true;
  }
  recent.push(now);
  rateLimit.set(key, recent);
  return false;
}

function getFirstFieldValue(fields: Fields, name: string): string | null {
  const raw = fields[name];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return typeof value === 'string' ? value : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'UPLOAD_AUTH_REQUIRED' });
  }

  const { auth } = getAdmin();
  let uid: string;
  try {
    const decoded = await auth.verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    return res.status(401).json({ error: 'UPLOAD_AUTH_INVALID' });
  }

  const limiterKey = getClientKey(req, uid);
  if (isRateLimited(limiterKey)) {
    return res.status(429).json({ error: 'RATE_LIMIT' });
  }

  let tmpPath: string | null = null;
  try {
    const { fields, files } = await parseForm(req);
    const rawFile = files.file;
    if (!rawFile) {
      return res.status(400).json({ error: 'UPLOAD_FILE_MISSING' });
    }
    const file = Array.isArray(rawFile) ? rawFile[0] : rawFile;
    
    if (!file) {
      return res.status(400).json({ error: 'UPLOAD_FILE_MISSING' });
    }

    const requestedUserId = getFirstFieldValue(fields, 'userId');
    if (!requestedUserId || requestedUserId !== uid) {
      return res.status(403).json({ error: 'UPLOAD_FORBIDDEN' });
    }

    const bucket =
      requireEnv('DO_SPACES_BUCKET') ||
      requireEnv('NEXT_PUBLIC_STORAGE_BUCKET');
    const accessKey = requireEnv('DO_SPACES_KEY');
    const secretKey = requireEnv('DO_SPACES_SECRET');
    const region = requireEnv('DO_SPACES_REGION') || 'fra1';
    if (!bucket || !accessKey || !secretKey) {
      return res.status(500).json({ error: 'UPLOAD_CONFIG_MISSING' });
    }

    const filepath = file.filepath;
    if (!filepath) {
      return res.status(400).json({ error: 'UPLOAD_FILE_MISSING' });
    }

    const mimeType = file.mimetype || 'application/octet-stream';
    if (!ALLOWED_TYPES.has(mimeType)) {
      return res.status(415).json({ error: 'UPLOAD_INVALID_TYPE' });
    }

    const rawName = file.originalFilename || file.newFilename || 'upload';
    const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `img/profile/${uid}/${uuidv4()}-${safeName}`;
    const s3 = createS3Client(region, accessKey, secretKey);

    // Read the file content
    tmpPath = filepath;
    const fileContent = await fs.readFile(filepath);

    // Upload directly to Spaces from the server

    await s3.upload({
      Bucket: bucket,
      Key: key,
      Body: fileContent,
      ContentType: mimeType,
      ACL: 'public-read',
    }).promise();

    const publicUrl = `https://${bucket}.${region}.digitaloceanspaces.com/${key}`;
    
    // Clean up the temporary file
    await fs.unlink(filepath).catch(() => {});
    tmpPath = null;
    
    res.status(200).json({ publicUrl });
  } catch (error) {
    console.error('Profile picture upload failed', error);
    res.status(500).json({ 
      error: 'UPLOAD_FAILED',
    });
  } finally {
    if (tmpPath) {
      await fs.unlink(tmpPath).catch(() => {});
    }
  }
}
