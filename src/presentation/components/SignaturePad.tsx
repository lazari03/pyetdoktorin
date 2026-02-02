"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  onChange: (dataUrl: string) => void;
};

export function SignaturePad({ onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#4c1d95";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
  }, []);

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setDrawing(true);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const end = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDrawing(false);
    const dataUrl = canvas.toDataURL("image/png");
    compressAndSend(dataUrl);
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
      onChange(compressed.length > 60000 ? compressed.slice(0, 60000) : compressed);
    };
    img.src = dataUrl;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

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
          onPointerLeave={end}
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
