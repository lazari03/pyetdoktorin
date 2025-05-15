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
  // IMPORTANT: Use hardcoded fallback matching the one in .env.local for reliability
  const appId = process.env.AGORA_APP_ID?.trim() || "082a61eb4220431085400ae5e9d9a8f7";
  const appCertificate = process.env.AGORA_APP_CERTIFICATE?.trim() || "6591ede95bf048b1ac959b025565ea5d";
  
  // Enhanced logging for debugging
  console.log("Agora credentials check:");
  console.log(`- App ID available: ${!!appId}, length: ${appId?.length || 0}`);
  console.log(`- App Certificate available: ${!!appCertificate}, length: ${appCertificate?.length || 0}`);
  
  // Stricter validation of environment variables
  if (!appId || appId.length < 10) {
    console.error(`CRITICAL: Agora App ID is missing or invalid (length: ${appId?.length || 0})`);
    return res.status(500).json({ error: "Server configuration error: Agora App ID is not properly defined" });
  }

  if (!appCertificate || appCertificate.length < 10) {
    console.error(`CRITICAL: Agora App Certificate is missing or invalid (length: ${appCertificate?.length || 0})`);
    return res.status(500).json({ error: "Server configuration error: Agora Certificate is not properly defined" });
  }

  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600; // Token valid for 1 hour
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  try {
    // Ensure uid is numeric for RTC
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
    
    console.log(`Generated RTC token successfully for uid ${numericUid}`);
    
    // Return all tokens and necessary information
    res.status(200).json({ 
      token: rtcToken, // For backwards compatibility
      rtcToken,
      channelName,
      uid: numericUid,
      appId: appId,
      expiresAt: new Date(privilegeExpiredTs * 1000).toISOString()
    });
  } catch (error) {
    console.error("Error generating Agora tokens:", error);
    res.status(500).json({ 
      error: "Failed to generate tokens", 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}
