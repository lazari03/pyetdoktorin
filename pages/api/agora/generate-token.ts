import { RtcTokenBuilder, RtcRole } from "agora-access-token";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { channelName, uid } = req.body;

  if (!channelName || !uid) {
    return res.status(400).json({ error: "Missing channelName or uid" });
  }

  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE; // Store securely in .env

  if (!appId || !appCertificate) {
    return res.status(500).json({ error: "Agora appId or appCertificate is not defined" });
  }
  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600; // Token valid for 1 hour
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
    res.status(200).json({ token });
  } catch (error) {
    console.error("Error generating Agora token:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
}
