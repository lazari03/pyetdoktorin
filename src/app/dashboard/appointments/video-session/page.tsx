"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
// Use tree shaking import for AgoraUIKit
import AgoraUIKit from "agora-react-uikit";
import { useAuth } from "../../../../context/AuthContext";
import { useVideoStore } from "../../../../store/videoStore";
import Loader from "../../../components/Loader";

export default function VideoSessionPage() {
  const [videoCall, setVideoCall] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { token: storeToken, channelName: storeChannel, endCall } = useVideoStore();

  // Get parameters from URL if not in store
  const channel = searchParams?.get("channel") || storeChannel;
  const token = searchParams?.get("token") || storeToken;
  
  // For client-side, use the NEXT_PUBLIC_ prefixed variable
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  if (!appId) {
    console.error("CRITICAL: Agora App ID is not available in client environment");
  }

  const [rtcProps, setRtcProps] = useState<{
    appId: string;
    channel: string;
    token: string;
  } | null>(null);

  // Debug logging
  useEffect(() => {
    console.log("Video session initialization:", {
      hasChannel: !!channel,
      hasToken: !!token,
      hasAppId: !!appId,
      appIdPrefix: appId ? appId.substring(0, 5) + "..." : "missing"
    });
  }, [channel, token, appId]);

  // Redirect if user is not authenticated or missing parameters
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.warn("User is not authenticated. Redirecting to login.");
      router.push("/login");
      return;
    }

    if (!channel || !token) {
      console.warn("Missing channel or token. Redirecting to appointments.");
      router.push("/dashboard/appointments");
      return;
    }

    if (!appId) {
      console.error("Missing Agora App ID. Cannot initialize video session.");
      alert("Video session configuration error. Please contact support.");
      router.push("/dashboard/appointments");
      return;
    }
  }, [isAuthenticated, authLoading, channel, token, router, appId]);

  // Initialize Agora UI kit
  useEffect(() => {
    if (channel && token && appId && !rtcProps) {
      try {
        setRtcProps({
          appId,
          channel,
          token,
        });
      } catch (error) {
        console.error("Error initializing Agora session:", error);
        alert("An error occurred while initializing the video session. Please try again later.");
      }
    }
  }, [channel, token, rtcProps, appId]);

  const callbacks = {
    EndCall: () => {
      setVideoCall(false);
      endCall();
    },
  };

  if (authLoading || !rtcProps) {
    return <Loader />;
  }

  return videoCall ? (
    <div className="flex flex-col h-screen">
      <div className="p-4 bg-gray-100 flex justify-between items-center">
        <h1 className="text-xl font-bold">Video Consultation</h1>
        <div className="text-sm">
          {user?.name && <span className="mr-2">Connected as {user.name}</span>}
          <span className="bg-green-500 text-white px-2 py-1 rounded">Live</span>
        </div>
      </div>
      
      <div className="flex-grow" style={{ height: "calc(100vh - 70px)" }}>
        <AgoraUIKit rtcProps={rtcProps} callbacks={callbacks} />
      </div>
    </div>
  ) : (
    <div className="text-center p-10">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Call Ended</h3>
      <p className="mb-6 text-gray-600">Your video consultation has ended.</p>
      <div className="flex flex-col space-y-4 items-center">
        <button
          className="btn btn-primary px-6"
          onClick={() => setVideoCall(true)}
        >
          Rejoin Call
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => router.push("/dashboard/appointments")}
        >
          Back to Appointments
        </button>
      </div>
    </div>
  );
}