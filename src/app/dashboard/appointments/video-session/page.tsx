
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "@/presentation/components/Loader/Loader";
import { auth } from "@/config/firebaseconfig";
import { useTranslation } from "react-i18next";
import { VIDEO_ERROR_CODES } from "@/config/errorCodes";

export default function VideoSessionPage() {
  const [loading, setLoading] = useState(true);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenModeRef = useRef<"native" | "css" | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionToken = searchParams?.get("session") || null;
  const { t } = useTranslation();

  useEffect(() => {
    let isActive = true;
    const fetchRoomCode = async () => {
      if (!sessionToken) {
        if (!isActive) return;
        setError("missingSession");
        setLoading(false);
        return;
      }

      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          if (!isActive) return;
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
          if (!isActive) return;
          setError(payload.error || 'unauthorized');
          setLoading(false);
          return;
        }

        if (!isActive) return;
        setRoomCode(payload.roomCode);
        setLoading(false);
      } catch (err) {
        console.error('Failed to validate session', err);
        if (!isActive) return;
        setError('validationFailed');
        setLoading(false);
      }
    };

    fetchRoomCode();
    return () => {
      isActive = false;
    };
  }, [sessionToken]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (fullscreenModeRef.current !== "native") return;
      const isActive = typeof document !== "undefined" && !!document.fullscreenElement;
      if (!isActive) {
        fullscreenModeRef.current = null;
      }
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
    if (!el) return;
    const request = async () => {
      try {
        if (typeof el.requestFullscreen === "function") {
          await el.requestFullscreen();
          fullscreenModeRef.current = "native";
          setIsFullscreen(true);
          return;
        }
      } catch {
        // fall through to CSS fullscreen
      }
      fullscreenModeRef.current = "css";
      setIsFullscreen(true);
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

  useEffect(() => {
    if (typeof document === "undefined") return;
    const previousOverflow = document.body.style.overflow;
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
    document.body.style.overflow = previousOverflow;
    return undefined;
  }, [isFullscreen]);

  if (loading) {
    return <Loader />;
  }

  if (!roomCode) {
    const errorCopy =
      error === VIDEO_ERROR_CODES.AuthInvalid || error === VIDEO_ERROR_CODES.AuthMissing
        ? t("videoSessionExpiredCopy")
        : t("videoSessionFailedCopy");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="rounded-2xl bg-white shadow-lg p-8 text-center max-w-md">
          <p className="text-sm text-gray-700">
            {errorCopy}
          </p>
        </div>
      </div>
    );
  }

  const requestFullscreen = async () => {
    const el = containerRef.current;
    try {
      if (el && typeof el.requestFullscreen === "function") {
        await el.requestFullscreen();
        fullscreenModeRef.current = "native";
        setIsFullscreen(true);
        return;
      }
    } catch {
      // fall through to CSS fullscreen
    }
    fullscreenModeRef.current = "css";
    setIsFullscreen(true);
  };

  const exitFullscreen = async () => {
    try {
      if (typeof document !== "undefined" && document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // ignore
    } finally {
      fullscreenModeRef.current = null;
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
            {t("videoSessionExitFullscreen")}
          </button>
        )}
        {!isFullscreen && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-purple-600 font-semibold">
                {t("videoSessionEyebrow")}
              </p>
              <h1 className="text-2xl font-semibold text-gray-900">
                {t("videoSessionTitle")}
              </h1>
              <p className="text-sm text-gray-600">
                {t("videoSessionSubtitle")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={requestFullscreen}
                className="inline-flex items-center rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition"
              >
                {t("videoSessionFullscreen")}
              </button>
              <button
                type="button"
                onClick={() => router.replace("/dashboard")}
                className="inline-flex items-center rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                {t("videoSessionBackToDashboard")}
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
