"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useVideoSessionStore } from "../../store/videoSessionStore";
import dynamic from "next/dynamic";

// Dynamically import AgoraUIKit to avoid SSR issues
const AgoraUIKit = dynamic(() => import("agora-react-uikit"), { ssr: false });

export default function VideoSessionPage() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams?.get("channel") || "";
  const token = searchParams?.get("token") || "";
  // You may want to get uid/userId from auth context or generate random
  const uid = Math.floor(Math.random() * 1000000) + 1;
  const userId = typeof window !== "undefined" ? (localStorage.getItem("userId") || `user_${uid}`) : `user_${uid}`;

  const {
    rtcToken,
    rtmToken,
    channelName,
    loading,
    error,
    fetchTokens,
  } = useVideoSessionStore();

  useEffect(() => {
    if (appointmentId && userId) {
      fetchTokens(appointmentId, uid, userId);
    }
    // eslint-disable-next-line
  }, [appointmentId, userId]);

  if (loading) return <div>Loading video session...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!rtcToken || !rtmToken || !channelName) return <div>Initializing...</div>;

  // Remove 'enableChat' if your version of agora-react-uikit does not support it as a prop.
  // Chat is enabled by default in some versions, or you may need to use a different prop (e.g., 'chatProps').

  // RTM login error 2 (2010026) usually means the RTM userId is invalid or not matching the token.
  // Make sure the userId you use to generate the RTM token (on the backend) matches the one AgoraUIKit uses for RTM login.
  // By default, agora-react-uikit uses `uid` (number) for RTC and may use `uid.toString()` for RTM.
  // If your backend expects a specific userId, pass it as rtmUid if supported.

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <AgoraUIKit
        rtcProps={{
          appId: process.env.NEXT_PUBLIC_AGORA_APP_ID!,
          channel: channelName,
          token: rtcToken,
          uid,
        }}
        rtmProps={{
          token: rtmToken,
          // If your AgoraUIKit version supports it, add:
          // rtmUid: userId, // userId must match the one used to generate the RTM token
        }}
      />
    </div>
  );
}
