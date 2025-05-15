"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
// Use tree shaking import for AgoraUIKit
import AgoraUIKit from "agora-react-uikit";
import { useAuth } from "../../../../context/AuthContext";
import { useVideoStore } from "../../../../store/videoStore";
import Loader from "../../../components/Loader";
import AgoraRTM from 'agora-rtm-sdk';

export default function VideoSessionPage() {
  const [videoCall, setVideoCall] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading, user, uid } = useAuth();
  const { 
    token: storeToken,
    rtcToken: storeRtcToken,
    rtmToken: storeRtmToken, 
    channelName: storeChannel, 
    endCall, 
    setAuthStatus,
    appId: storeAppId,
    userId: storeUserId // <-- get sanitized userId from store
  } = useVideoStore();
  
  // Add state and refs for RTM
  const [rtmConnectionState, setRtmConnectionState] = useState<string>("DISCONNECTED");
  const [rtmError, setRtmError] = useState<string | null>(null);
  const rtmClientRef = useRef<any>(null);
  const rtmChannelRef = useRef<any>(null);

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
  const rtmToken = searchParams?.get("rtmToken") || storeRtmToken;
  // Always use the sanitized userId from store or URL (never local UID)
  const rtmUserId = searchParams?.get("userId") || storeUserId;
  
  // For client-side, use URL param first, then store value, then env var
  const appId = searchParams?.get("appId") || storeAppId || process.env.NEXT_PUBLIC_AGORA_APP_ID?.trim() || "082a61eb4220431085400ae5e9d9a8f7";
  
  // Debug logging for App ID and tokens
  useEffect(() => {
    if (!appId) {
      console.error("CRITICAL: Agora App ID is not available in client environment");
    } else {
      console.log(`Agora App ID detected with length: ${appId.length}, first/last chars: ${appId.substring(0, 3)}...${appId.substring(appId.length - 3)}`);
    }
    
    if (rtmToken) {
      console.log(`RTM token available with length: ${rtmToken.length}`);
    } else {
      console.warn("RTM token is missing - real-time messaging will not work");
    }
  }, [appId, rtmToken]);

  const [rtcProps, setRtcProps] = useState<{
    appId: string;
    channel: string;
    token: string;
  } | null>(null);

  // Initialize RTM client - critical for solving Error 102
  useEffect(() => {
    // Only initialize if we have all required data
    if (!appId || !rtmToken || !channel || !rtmUserId) {
      console.log("Cannot initialize RTM - missing required data:", {
        hasAppId: !!appId,
        hasRtmToken: !!rtmToken,
        hasChannel: !!channel,
        hasRtmUserId: !!rtmUserId
      });
      return;
    }

    try {
      // Create RTM client
      console.log("Initializing RTM client with AppID:", appId.substring(0, 4) + "...");
      const rtmClient = AgoraRTM.createInstance(appId);
      rtmClientRef.current = rtmClient;
      
      // Set up event listeners for connection state
      rtmClient.on('ConnectionStateChanged', (newState, reason) => {
        console.log(`RTM connection state changed: ${newState}, reason: ${reason}`);
        setRtmConnectionState(newState);
      });

      // Only use the sanitized RTM userId from the token API
      const safeRtmUserId = rtmUserId.replace(/[^a-zA-Z0-9_=+-]/g, '_').substring(0, 64);
      
      // Login to RTM with token
      console.log(`Logging into RTM as user ID: ${safeRtmUserId}`);
      rtmClient.login({ 
        token: rtmToken, 
        uid: safeRtmUserId
      })
        .then(() => {
          console.log("RTM login successful!");
          setRtmError(null);
          
          // Join the RTM channel after successful login
          const rtmChannel = rtmClient.createChannel(channel);
          rtmChannelRef.current = rtmChannel;
          
          // Set up channel event handlers
          rtmChannel.on('ChannelMessage', (message, senderId) => {
            console.log(`RTM message from ${senderId}:`, message.description || message.description);
          });
          
          // Join the channel
          rtmChannel.join()
            .then(() => {
              console.log(`Successfully joined RTM channel: ${channel}`);
              // Send a test message to verify everything is working
              rtmChannel.sendMessage({ text: "I've joined the session" })
                .then(() => {
                  console.log("Test message sent successfully");
                })
                .catch(err => {
                  console.error("Error sending test message:", err);
                });
            })
            .catch(err => {
              console.error("Failed to join RTM channel:", err);
              setRtmError(`Failed to join RTM channel: ${err.message || err}`);
            });
        })
        .catch(err => {
          console.error("RTM login failed:", err);
          setRtmError(`RTM login failed: ${err.message || err} (Code: ${err.code || 'unknown'})`);
          
          // Log more details for debugging
          console.log("RTM login details:", {
            appId: appId.substring(0, 4) + "...",
            userId: safeRtmUserId,
            tokenLength: rtmToken.length,
            channelName: channel
          });
        });
      
      // Cleanup function
      return () => {
        // Leave channel and logout when component unmounts
        if (rtmChannelRef.current) {
          rtmChannelRef.current.leave().catch(console.error);
        }
        if (rtmClientRef.current) {
          rtmClientRef.current.logout().catch(console.error);
        }
      };
    } catch (error) {
      console.error("Error setting up RTM:", error);
      setRtmError(`Failed to initialize RTM: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [appId, rtmToken, channel, rtmUserId]);

  // Debug logging
  useEffect(() => {
    console.log("Video session initialization:", {
      hasChannel: !!channel,
      hasRtcToken: !!rtcToken,
      hasRtmToken: !!rtmToken,
      hasAppId: !!appId,
      rtmUserId: rtmUserId,
      channelName: channel,
      rtmConnectionState,
      rtmError
    });
  }, [channel, rtcToken, rtmToken, appId, rtmUserId, rtmConnectionState, rtmError]);

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
      
      // Clean up RTM resources
      if (rtmChannelRef.current) {
        rtmChannelRef.current.leave().catch(console.error);
      }
      if (rtmClientRef.current) {
        rtmClientRef.current.logout().catch(console.error);
      }
      
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
          {rtmConnectionState && (
            <span className={`ml-2 px-2 py-1 rounded ${
              rtmConnectionState === "CONNECTED" ? "bg-green-500" : "bg-yellow-500"
            } text-white`}>
              RTM: {rtmConnectionState}
            </span>
          )}
        </div>
      </div>
      
      {rtmError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4">
          <p><strong>RTM Error:</strong> {rtmError}</p>
          <p className="text-sm">Chat functionality might not work properly.</p>
        </div>
      )}
      
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