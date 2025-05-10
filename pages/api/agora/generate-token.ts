import { RtcTokenBuilder, RtcRole } from "agora-access-token";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract all parameters from the request
  const { channelName, uid } = req.body;

  // Validate required parameters
  if (!channelName || uid === undefined) {
    console.error("Missing channelName or uid in request body");
    return res.status(400).json({ error: "Missing channelName or uid" });
  }

  // Use environment variables correctly in API routes
  // Check for both server-side and client-side variables for flexibility
  const appId = process.env.AGORA_APP_ID || process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  // Log detailed information for debugging
  console.log("Agora credentials check:");
  console.log(`- App ID available: ${!!appId}`);
  console.log(`- App Certificate available: ${!!appCertificate}`);
  
  // Do thorough validation of environment variables
  if (!appId) {
    console.error("CRITICAL: Agora App ID is missing");
    return res.status(500).json({ error: "Server configuration error: Agora App ID is not defined" });
  }

  if (!appCertificate) {
    console.error("CRITICAL: Agora App Certificate is missing");
    return res.status(500).json({ error: "Server configuration error: Agora Certificate is not defined" });
  }

  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600; // Token valid for 1 hour
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  try {
    // Ensure uid is numeric
    const numericUid = typeof uid === 'string' ? parseInt(uid, 10) : uid;
    
    // Generate the RTC token for video calling
    const rtcToken = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      numericUid,
      role,
      privilegeExpiredTs
    );
    
    // Return only what's needed - don't expose sensitive data
    res.status(200).json({ 
      token: rtcToken,
      channelName,
      uid: numericUid,
      expiresAt: new Date(privilegeExpiredTs * 1000).toISOString()
    });
  } catch (error) {
    console.error("Error generating Agora token:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
}
