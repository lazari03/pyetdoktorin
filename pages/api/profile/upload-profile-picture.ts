import type { NextApiRequest, NextApiResponse } from 'next';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { IncomingForm, type File as FormidableFile } from 'formidable';
import fs from 'fs/promises';

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
const region = 'fra1';
const endpoint = `${region}.digitaloceanspaces.com`;
const spacesEndpoint = new AWS.Endpoint(endpoint);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACES_KEY || 'missing',
  secretAccessKey: process.env.DO_SPACES_SECRET || 'missing',
  region,
  signatureVersion: 'v4',
});

function parseForm(req: NextApiRequest) {
  const form = new IncomingForm({
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
    keepExtensions: true,
  });
  return new Promise<{ fields: Record<string, unknown>; files: Record<string, FormidableFile | FormidableFile[]> }>((resolve, reject) => {
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { files } = await parseForm(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    
    if (!file) {
      return res.status(400).json({ error: 'UPLOAD_FILE_MISSING' });
    }

    const bucket = requireEnv('DO_SPACES_BUCKET');
    const accessKey = requireEnv('DO_SPACES_KEY');
    const secretKey = requireEnv('DO_SPACES_SECRET');
    if (!bucket || !accessKey || !secretKey) {
      return res.status(500).json({ error: 'UPLOAD_CONFIG_MISSING' });
    }

    const filepath = file.filepath || file.path;
    if (!filepath) {
      return res.status(400).json({ error: 'UPLOAD_FILE_MISSING' });
    }

    const mimeType = file.mimetype || 'application/octet-stream';
    if (!ALLOWED_TYPES.has(mimeType)) {
      return res.status(415).json({ error: 'UPLOAD_INVALID_TYPE' });
    }

    const originalName = file.originalFilename || file.newFilename || 'upload';
    const key = `img/doc-img/${uuidv4()}-${originalName}`;

    // Read the file content
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
    await fs.unlink(filepath);
    
    res.status(200).json({ publicUrl });
  } catch (error) {
    console.error('Profile picture upload failed', error);
    res.status(500).json({ 
      error: 'UPLOAD_FAILED',
    });
  }
}
