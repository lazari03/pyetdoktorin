
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "@/presentation/components/Loader/Loader";
import { auth } from "@/config/firebaseconfig";

export default function VideoSessionPage() {
  const [loading, setLoading] = useState(true);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
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
    const handleFullscreenChange = () => {
      const isActive = typeof document !== "undefined" && !!document.fullscreenElement;
      setIsFullscreen(isActive);
    };
    if (typeof document !== "undefined") {
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }
    return undefined;
  }, []);

  useEffect(() => {
    if (!roomCode) return;
    const el = containerRef.current;
    if (!el || typeof el.requestFullscreen !== "function") return;
    const request = async () => {
      try {
        await el.requestFullscreen();
        setIsFullscreen(true);
      } catch {
        setIsFullscreen(false);
      }
    };
    request();
  }, [roomCode]);

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

  const requestFullscreen = async () => {
    const el = containerRef.current;
    if (!el || typeof el.requestFullscreen !== "function") return;
    try {
      await el.requestFullscreen();
      setIsFullscreen(true);
    } catch {
      setIsFullscreen(false);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (typeof document !== "undefined" && document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // ignore
    } finally {
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div
        ref={containerRef}
        className={isFullscreen ? "fixed inset-0 z-50 bg-black" : "mx-auto w-full max-w-5xl space-y-4"}
      >
        {isFullscreen && (
          <button
            type="button"
            onClick={exitFullscreen}
            className="absolute top-4 right-4 z-50 rounded-full bg-purple-600 text-white px-4 py-2 text-xs font-semibold shadow-lg hover:bg-purple-700"
          >
            Exit full screen
          </button>
        )}
        {!isFullscreen && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-purple-600 font-semibold">Video session</p>
              <h1 className="text-2xl font-semibold text-gray-900">In call</h1>
              <p className="text-sm text-gray-600">Tap full screen to expand the call.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={requestFullscreen}
                className="inline-flex items-center rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition"
              >
                Full screen
              </button>
              <button
                type="button"
                onClick={() => router.replace("/dashboard")}
                className="inline-flex items-center rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Back to dashboard
              </button>
            </div>
          </div>
        )}
        <div className={isFullscreen ? "h-full w-full" : "rounded-2xl overflow-hidden border border-gray-200 bg-black shadow-lg"}>
          <iframe
            src={`https://pyetdoktorin-videoconf-1921.app.100ms.live/meeting/${roomCode}`}
            title="100ms Video Call"
            allow="camera; microphone; fullscreen; display-capture"
            allowFullScreen
            className={isFullscreen ? "h-full w-full" : "h-[70vh] w-full"}
          />
        </div>
      </div>
    </div>
  );
}
