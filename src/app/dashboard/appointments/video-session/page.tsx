
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

  const subdomain = process.env.NEXT_PUBLIC_HMS_SUBDOMAIN;
  const iframeUrl = `https://${subdomain}.100ms.live/preview/${roomCode}`;

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', padding: 0, margin: 0, zIndex: 10 }}>
      <iframe
        src={iframeUrl}
        title="100ms Video Call"
        allow="camera; microphone; fullscreen; display-capture"
        style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', border: 'none', display: 'block' }}
      />
    </div>
  );
}