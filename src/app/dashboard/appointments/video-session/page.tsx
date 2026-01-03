
"use client";
import { useEffect, useState, useRef } from "react";
import Loader from "../../../components/Loader";

export default function VideoSessionPage() {
  const [loading, setLoading] = useState(true);
  const [, setUserName] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Read from localStorage (or Zustand if you prefer)
    const code = window.localStorage.getItem('videoSessionRoomCode');
    const uname = window.localStorage.getItem('videoSessionUserName');
    if (code && uname) {
      setRoomCode(code);
      setUserName(uname);
      // Keep loading true until iframe loads
    } else {
      setLoading(false);
    }

    // Fallback: if iframe doesn't load in 15s, hide loader
    const timeout = setTimeout(() => setLoading(false), 15000);
    return () => clearTimeout(timeout);
  }, []);

  if (loading || !roomCode) {
    return <Loader />;
  }

  return (
    <>
      {loading && <Loader />}
      <iframe
        ref={iframeRef}
        src={`https://portokalle-videoconf-1921.app.100ms.live/meeting/${roomCode}`}
        title="100ms Video Call"
        allow="camera; microphone; fullscreen; display-capture"
        style={{ width: '100%', height: '100vh', border: 'none', display: loading ? 'none' : 'block' }}
        onLoad={() => setLoading(false)}
      />
    </>
  );
}