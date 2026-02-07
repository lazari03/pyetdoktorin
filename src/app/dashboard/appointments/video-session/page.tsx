
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "@/presentation/components/Loader/Loader";
import { auth } from "@/config/firebaseconfig";

export default function VideoSessionPage() {
  const [loading, setLoading] = useState(true);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionToken = searchParams?.get("session") || null;

  useEffect(() => {
    const fetchRoomCode = async () => {
      if (!sessionToken) {
        setError("missingSession");
        setLoading(false);
        return;
      }

      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setError("sessionExpired");
          setLoading(false);
          return;
        }

        const idToken = await currentUser.getIdToken();
        const response = await fetch('/api/100ms/validate-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ sessionToken }),
        });

        const payload = await response.json();
        if (!response.ok || !payload.roomCode) {
          setError(payload.error || 'unauthorized');
          setLoading(false);
          return;
        }

        setRoomCode(payload.roomCode);
        setLoading(false);
      } catch (err) {
        console.error('Failed to validate session', err);
        setError('validationFailed');
        setLoading(false);
      }
    };

    fetchRoomCode();
  }, [sessionToken]);

  useEffect(() => {
    if (error && !roomCode) {
      const timer = setTimeout(() => router.replace('/dashboard'), 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [error, roomCode, router]);

  if (loading) {
    return <Loader />;
  }

  if (!roomCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="rounded-2xl bg-white shadow-lg p-8 text-center max-w-md">
          <p className="text-sm text-gray-700">
            {error === 'sessionExpired'
              ? 'Your session expired. Please go back and try joining again.'
              : 'Unable to start the video session. Redirecting to dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src={`https://pyetdoktorin-videoconf-1921.app.100ms.live/meeting/${roomCode}`}
      title="100ms Video Call"
      allow="camera; microphone; fullscreen; display-capture"
      style={{ width: '100%', height: '100vh', border: 'none' }}
    />
  );
}
