
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
      console.log('Loaded roomCode for 100ms video session:', code);
      setRoomCode(code);
      setUserName(uname);
      setLoading(false);
    }
  }, []);

  if (loading || !roomCode) {
    return <Loader />;
  }

  return (
    <iframe
      src={`https://portokalle-videoconf-1921.app.100ms.live/meeting/${roomCode}`}
      title="100ms Video Call"
      allow="camera; microphone; fullscreen; display-capture"
      style={{ width: '100%', height: '100vh', border: 'none' }}
    />
  );
}