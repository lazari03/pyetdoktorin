import { RtcTokenBuilder, RtcRole, RtmTokenBuilder } from "agora-access-token";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract all parameters from the request
  const { channelName, uid } = req.body;
  
  // For RTM we need a string-based user ID
  // Make sure to sanitize the user ID to avoid rejection
  let rtmUserId = req.body.userId || `user-${uid}`;
  
  // RTM doesn't accept user IDs with certain characters - sanitize it
  rtmUserId = rtmUserId.toString()
    .replace(/[^a-zA-Z0-9_=+-]/g, '_') // Replace invalid chars with underscores
    .substring(0, 64); // Maximum 64 characters allowed

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
  console.log(`- RTM User ID: ${rtmUserId}`);
  
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
    
    // Generate an RTM token for messaging
    const rtmToken = RtmTokenBuilder.buildToken(
      appId,
      appCertificate,
      rtmUserId, // Use sanitized RTM user ID
      1, // RTM role (1 for publisher)
      privilegeExpiredTs
    );
    
    console.log(`Generated tokens successfully: RTC for uid ${numericUid}, RTM for userId ${rtmUserId}`);
    
    // Return all tokens and necessary information
    res.status(200).json({ 
      token: rtcToken, // For backwards compatibility
      rtcToken,
      rtmToken,
      channelName,
      uid: numericUid,
      userId: rtmUserId, // Include sanitized RTM user ID
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
