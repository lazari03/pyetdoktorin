"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import AgoraUIKit from "agora-react-uikit";
import { useAuth } from "../../../../context/AuthContext"; // Import AuthContext

export default function VideoSessionPage() {
  const [videoCall, setVideoCall] = useState(true);
  const [sessionEnded, setSessionEnded] = useState(false); // Track if the session has ended
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams ? searchParams.get("appointmentId") : null;

  const { isAuthenticated, loading } = useAuth(); // Access authentication state

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

  const rtcProps = {
    appId: "6beb2136e5bc4a62b836bcded2dbb875", // Replace with your Agora App ID
    channel: sanitizedChannelName, // Use the sanitized and truncated channel name
    token: "", // Replace with your Agora token or use null for testing
  };

  const callbacks = {
    EndCall: () => {
      setVideoCall(false);
      setSessionEnded(true); // Mark the session as ended
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return videoCall ? (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <AgoraUIKit rtcProps={rtcProps} callbacks={callbacks} />
    </div>
  ) : (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h3>Call Ended</h3>
      {sessionEnded ? (
        <p>The session has ended. You cannot rejoin the call.</p>
      ) : (
        <button className="btn btn-primary" onClick={() => setVideoCall(true)}>
          Restart Call
        </button>
      )}
      <button className="btn btn-secondary" onClick={() => router.push("/dashboard/appointments")}>
        Back to Appointments
      </button>
    </div>
  );
}