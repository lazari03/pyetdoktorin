
"use client";
import { useEffect, useState } from "react";
import Loader from "../../../components/Loader";

export default function VideoSessionPage() {
  const [loading, setLoading] = useState(true);
  const [, setUserName] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);

  useEffect(() => {
    // Read from localStorage (or Zustand if you prefer)
    const code = window.localStorage.getItem('videoSessionRoomCode');
    const uname = window.localStorage.getItem('videoSessionUserName');
    if (code && uname) {
      setRoomCode(code);
      setUserName(uname);
      setLoading(false);
    }
  }, []);

  if (loading || !roomCode) {
    return <Loader />;
  }

  const baseUrl = process.env.NEXT_PUBLIC_VIDEO_SESSION_URL;
  return (
    <iframe
      src={`${baseUrl}${roomCode}`}
      title="100ms Video Call"
      allow="camera; microphone; fullscreen; display-capture"
      style={{ width: '100%', height: '100vh', border: 'none' }}
    />
  );
}