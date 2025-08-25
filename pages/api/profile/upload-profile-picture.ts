import type { NextApiRequest, NextApiResponse } from 'next';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { IncomingForm } from 'formidable';
import fs from 'fs';

// Disable default body parsing to handle FormData
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to check env vars
function checkEnvVar(name: string) {
  if (!process.env[name]) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return process.env[name]!;
}

// Configure AWS SDK for DigitalOcean Spaces
const region = 'fra1';
const endpoint = `${region}.digitaloceanspaces.com`;
const spacesEndpoint = new AWS.Endpoint(endpoint);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: checkEnvVar('DO_SPACES_KEY'),
  secretAccessKey: checkEnvVar('DO_SPACES_SECRET'),
  region,
  signatureVersion: 'v4',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the multipart form data
    const form = new IncomingForm({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      keepExtensions: true,
    });

    const [, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const bucket = checkEnvVar('DO_SPACES_BUCKET');
    const key = `img/doc-img/${uuidv4()}-${file.originalFilename}`;

    // Read the file content
    const fileContent = fs.readFileSync(file.filepath);

    // Upload directly to Spaces from the server

    await s3.upload({
      Bucket: bucket,
      Key: key,
      Body: fileContent,
      ContentType: file.mimetype || 'application/octet-stream',
      ACL: 'public-read',
    }).promise();

    const publicUrl = `https://${bucket}.${region}.digitaloceanspaces.com/${key}`;
    
    // Clean up the temporary file
    fs.unlinkSync(file.filepath);
    
    res.status(200).json({ publicUrl });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to upload file', 
      details: error instanceof Error ? error.message : error 
    });
  }
}
