import { NextApiRequest, NextApiResponse } from "next";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { appointmentId } = req.body;

  if (!appointmentId || typeof appointmentId !== "string") {
    return res.status(400).json({ error: "Missing or invalid appointmentId" });
  }

  // Use the same env variable names as generate-token
  const appId = process.env.AGORA_APP_ID?.trim() || "082a61eb4220431085400ae5e9d9a8f7";
  const appCertificate = process.env.AGORA_APP_CERTIFICATE?.trim() || "6591ede95bf048b1ac959b025565ea5d";

  if (!appId || !appCertificate) {
    return res.status(500).json({ error: "Agora credentials are not properly configured" });
  }
  const channelName = appointmentId; // Use appointmentId as the channel name
  const uid = 0; // Use 0 for a user ID if not specified
  const role = RtcRole.PUBLISHER; // Role for the user
  const expirationTimeInSeconds = 3600; // Token expiration time in seconds

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  try {
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      privilegeExpiredTs
    );

    res.status(200).json({
      // Redirect to the main video session page
      sessionUrl: `/dashboard/appointments/video-session?channel=${channelName}&rtcToken=${token}`,
    });
  } catch (error) {
    console.error("Error generating Agora token:", error);
    res.status(500).json({ error: "Failed to create video call session" });
  }
}