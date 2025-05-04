"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import AgoraUIKit from "agora-react-uikit";
import { useAuth } from "../../../../context/AuthContext"; // Import AuthContext
import Loader from "../../../components/Loader"; // Use existing Loader component

export default function VideoSessionPage() {
  const [videoCall, setVideoCall] = useState(true);
  const [rtcProps, setRtcProps] = useState<{
    appId: string;
    channel: string;
    token: string | null;
  } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams ? searchParams.get("appointmentId") : null;

  const { isAuthenticated, loading, user } = useAuth(); // Access authentication state

  // Sanitize and truncate the appointmentId to ensure it meets Agora's channel name requirements
  const sanitizedChannelName = appointmentId
    ? appointmentId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64) // Replace invalid characters and truncate
    : "defaultChannel"; // Fallback channel name if appointmentId is missing

  // Redirect if user is not authenticated or appointmentId is missing
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        console.warn("User is not authenticated. Redirecting to login.");
        router.push("/login"); // Redirect to login if not authenticated
      } else if (!appointmentId) {
        console.warn("Missing appointmentId. Redirecting to appointments dashboard.");
        router.push("/dashboard/appointments"); // Redirect if appointmentId is missing
      }
    }
  }, [isAuthenticated, loading, appointmentId, router]);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch("/api/agora/generate-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channelName: sanitizedChannelName, uid: user?.uid }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch Agora token");
        }

        const { token } = await response.json();
        setRtcProps({
          appId: process.env.NEXT_PUBLIC_AGORA_APP_ID!,
          channel: sanitizedChannelName,
          token: token || null, // Use null if no token is provided
        });
      } catch (error) {
        console.error("Error fetching Agora token:", error);
      }
    };

    if (appointmentId) {
      fetchToken();
    }
  }, [appointmentId, sanitizedChannelName, user?.uid]);

  const callbacks = {
    EndCall: () => setVideoCall(false),
  };

  if (loading || !rtcProps) {
    return <Loader />;
  }

  return videoCall ? (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <AgoraUIKit rtcProps={rtcProps} callbacks={callbacks} />
    </div>
  ) : (
    <div className="text-center">
      <h3 className="text-xl font-bold text-gray-800" onClick={() => setVideoCall(true)}>
        Start Call
      </h3>
      <button
        className="btn btn-secondary mt-4"
        onClick={() => router.push("/dashboard/appointments")}
      >
        Back to Appointments
      </button>
    </div>
  );
}