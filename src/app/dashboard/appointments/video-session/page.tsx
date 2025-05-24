"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
// Dynamically import AgoraUIKit to avoid SSR issues
const AgoraUIKit = dynamic(() => import("agora-react-uikit"), { ssr: false });

import { useAuth } from "../../../../context/AuthContext";
import { useVideoStore } from "../../../../store/videoStore";
import Loader from "../../../components/Loader";

export default function VideoSessionPage() {
  const [videoCall, setVideoCall] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading, user, uid } = useAuth();
  const { 
    token: storeToken,
    rtcToken: storeRtcToken,
    channelName: storeChannel, 
    endCall, 
    setAuthStatus,
    appId: storeAppId,
  } = useVideoStore();

  // Sync auth state with video store whenever auth context changes
  useEffect(() => {
    setAuthStatus(
      isAuthenticated, 
      uid || null, 
      user?.name || null
    );
  }, [isAuthenticated, uid, user, setAuthStatus]);

  // Get parameters from URL if not in store
  const channel = searchParams?.get("channel") || storeChannel;
  const rtcToken = searchParams?.get("rtcToken") || storeRtcToken || storeToken; // backward compatibility
  const appId = searchParams?.get("appId") || storeAppId || process.env.NEXT_PUBLIC_AGORA_APP_ID?.trim() || "082a61eb4220431085400ae5e9d9a8f7";
  
  // Debug logging for App ID and tokens
  useEffect(() => {
    if (!appId) {
      console.error("CRITICAL: Agora App ID is not available in client environment");
    } else {
      console.log(`Agora App ID detected with length: ${appId.length}, first/last chars: ${appId.substring(0, 3)}...${appId.substring(appId.length - 3)}`);
    }
  }, [appId]);

  const [rtcProps, setRtcProps] = useState<{
    appId: string;
    channel: string;
    token: string;
  } | null>(null);

  // Redirect if user is not authenticated or missing parameters
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.warn("User is not authenticated. Redirecting to login.");
      router.push("/login");
      return;
    }

    if (!channel || !rtcToken) {
      console.warn("Missing channel or RTC token. Redirecting to appointments.");
      router.push("/dashboard/appointments");
      return;
    }

    if (!appId) {
      console.error("Missing Agora App ID. Cannot initialize video session.");
      alert("Video session configuration error. Please contact support.");
      router.push("/dashboard/appointments");
      return;
    }
  }, [isAuthenticated, authLoading, channel, rtcToken, router, appId]);

  // Initialize Agora UI kit with more explicit validation
  useEffect(() => {
    if (channel && rtcToken && appId && !rtcProps) {
      try {
        // Validate App ID format
        if (appId.length < 10) {
          throw new Error(`Invalid Agora App ID format: length is ${appId.length}, expected 32 characters`);
        }
        
        // Set props for AgoraUIKit - ensuring appId is a proper string without whitespace
        const safeAppId = appId.trim();
        console.log(`Initializing AgoraUIKit with AppID length: ${safeAppId.length}`);
        
        setRtcProps({
          appId: safeAppId,
          channel,
          token: rtcToken,
        });
        
        console.log("Agora RTC Props successfully initialized");
      } catch (error) {
        console.error("Error initializing Agora session:", error);
        alert("An error occurred while initializing the video session. Please try again later.");
      }
    }
  }, [channel, rtcToken, rtcProps, appId]);

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
    <div className="flex flex-col min-h-screen h-screen w-screen">
      <div className="p-4 bg-gray-100 flex justify-between items-center">
        <h1 className="text-xl font-bold">Video Consultation</h1>
        <div className="text-sm">
          {user?.name && <span className="mr-2">Connected as {user.name}</span>}
          <span className="bg-green-500 text-white px-2 py-1 rounded">Live</span>
        </div>
      </div>
      <div className="flex-grow w-full" style={{ minHeight: "600px", height: "calc(100vh - 64px)" }}>
        <AgoraUIKit
          rtcProps={rtcProps}
          callbacks={callbacks}
          styleProps={{
            localBtnContainer: { zIndex: 20 },
            UIKitContainer: { height: "100%", minHeight: "600px" }
          }}
        />
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