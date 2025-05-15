"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useVideoSessionStore } from "../../store/videoSessionStore";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import AgoraUIKit to avoid SSR issues
const AgoraUIKit = dynamic(() => import("agora-react-uikit"), { ssr: false });

export default function VideoSessionPageWrapper() {
  return (
    <Suspense fallback={<div>Loading video session...</div>}>
      <VideoSessionPage />
    </Suspense>
  );
}

// Move your current VideoSessionPage code to a new component:
function VideoSessionPage() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams?.get("channel") || "";
  const token = searchParams?.get("token") || "";
  const uid = Math.floor(Math.random() * 1000000) + 1;

  const {
    rtcToken,
    channelName,
    loading,
    error,
    fetchTokens,
  } = useVideoSessionStore();

  useEffect(() => {
    if (appointmentId) {
      fetchTokens(appointmentId, uid, token); // Pass token as third argument
    }
    // eslint-disable-next-line
  }, [appointmentId, uid, token]);

  if (loading) return <div>Loading video session...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!rtcToken || !channelName) return <div>Initializing...</div>;

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <AgoraUIKit
        rtcProps={{
          appId: process.env.NEXT_PUBLIC_AGORA_APP_ID!,
          channel: channelName,
          token: rtcToken,
          uid,
        }}
      />
    </div>
  );
}
