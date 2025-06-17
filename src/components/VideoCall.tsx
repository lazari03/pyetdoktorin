import { useEffect, useRef, useState } from 'react';

export default function VideoCall() {
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const clientRef = useRef<any>(null); // Replace with the appropriate type if available
  const [isJoined, setIsJoined] = useState(false);

  const leaveChannel = async () => {
    if (clientRef.current && isJoined) {
      await clientRef.current.leave();
      setIsJoined(false);
    }
    stopMediaTracks();
  };

  const stopMediaTracks = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      mediaStreamRef.current = null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      if (isMounted) {
        mediaStreamRef.current = stream;
        // Optionally attach to video element here
      }
    });

    // Example Agora client init:
    // clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

    return () => {
      isMounted = false;
      leaveChannel(); // leave call and stop media
    };
  }, []);

  return null; // Add your UI here
}