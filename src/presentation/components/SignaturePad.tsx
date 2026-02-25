"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  onChange: (dataUrl: string) => void;
  onDraftChange?: (dataUrl: string) => void;
  saveSignal?: number;
  autoSave?: boolean;
};

export function SignaturePad({ onChange, onDraftChange, saveSignal, autoSave = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [draftDataUrl, setDraftDataUrl] = useState("");
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const lastMidRef = useRef<{ x: number; y: number } | null>(null);
  const smoothPointRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#4c1d95";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.miterLimit = 1;
  }, []);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.setPointerCapture(e.pointerId);
    const point = getPoint(e);
    if (!point) return;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    lastPointRef.current = point;
    lastMidRef.current = point;
    smoothPointRef.current = point;
    setDrawing(true);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const point = getPoint(e);
    if (!point) return;
    const lastPoint = lastPointRef.current;
    const lastMid = lastMidRef.current;
    const lastSmooth = smoothPointRef.current ?? point;
    const alpha = 0.7;
    const smooth = {
      x: lastSmooth.x + (point.x - lastSmooth.x) * alpha,
      y: lastSmooth.y + (point.y - lastSmooth.y) * alpha,
    };
    smoothPointRef.current = smooth;
    if (!lastPoint || !lastMid) {
      lastPointRef.current = smooth;
      lastMidRef.current = smooth;
      ctx.lineTo(smooth.x, smooth.y);
      ctx.stroke();
      return;
    }
    const mid = {
      x: (lastPoint.x + smooth.x) / 2,
      y: (lastPoint.y + smooth.y) / 2,
    };
    ctx.beginPath();
    ctx.moveTo(lastMid.x, lastMid.y);
    ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, mid.x, mid.y);
    ctx.stroke();
    lastPointRef.current = smooth;
    lastMidRef.current = mid;
  };

  const end = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    setDrawing(false);
    lastPointRef.current = null;
    lastMidRef.current = null;
    smoothPointRef.current = null;
    const dataUrl = canvas.toDataURL("image/png");
    compressAndSend(dataUrl);
  };

  const updateDraft = (dataUrl: string) => {
    setDraftDataUrl(dataUrl);
    onDraftChange?.(dataUrl);
    if (autoSave) {
      onChange(dataUrl);
    }
  };

  const compressAndSend = (dataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      const maxW = 300;
      const maxH = 120;
      const scale = Math.min(maxW / img.width, maxH / img.height, 1);
      const w = Math.max(1, Math.floor(img.width * scale));
      const h = Math.max(1, Math.floor(img.height * scale));
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const ctx = off.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      const compressed = off.toDataURL("image/png", 0.8);
      updateDraft(compressed.length > 60000 ? compressed.slice(0, 60000) : compressed);
    };
    img.src = dataUrl;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateDraft("");
  };

  useEffect(() => {
    if (saveSignal === undefined || autoSave) return;
    onChange(draftDataUrl);
  }, [saveSignal, autoSave, draftDataUrl, onChange]);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-700">Signature</p>
      <div className="rounded-2xl border border-gray-300 bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          width={500}
          height={160}
          className="w-full touch-none"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
        />
      </div>
      <div className="flex justify-end">
        <button type="button" onClick={clear} className="text-xs text-purple-600 hover:underline">
          Clear
        </button>
      </div>
    </div>
  );
}
