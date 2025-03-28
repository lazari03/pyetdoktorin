"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import AgoraUIKit from "agora-react-uikit";

export default function VideoSessionPage() {
  const [videoCall, setVideoCall] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams ? searchParams.get("appointmentId") : null;

  const rtcProps = {
    appId: "6beb2136e5bc4a62b836bcded2dbb875", // Replace with your Agora App ID
    channel: `appointment-${appointmentId}`, // Unique channel for each appointment
    token: "", // Replace with your Agora token or use null for testing
  };

  const callbacks = {
    EndCall: () => setVideoCall(false),
  };

  return videoCall ? (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <AgoraUIKit rtcProps={rtcProps} callbacks={callbacks} />
    </div>
  ) : (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h3>Call Ended</h3>
      <button className="btn btn-primary" onClick={() => setVideoCall(true)}>
        Restart Call
      </button>
      <button className="btn btn-secondary" onClick={() => router.push("/dashboard/appointments")}>
        Back to Appointments
      </button>
    </div>
  );
}
