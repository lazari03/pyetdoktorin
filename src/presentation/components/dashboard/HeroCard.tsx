import { PhoneIcon, VideoCameraIcon, MicrophoneIcon } from "@heroicons/react/24/outline";
import { PhoneXMarkIcon } from "@heroicons/react/24/solid";
import React from "react";

type HeroCardProps = {
  title: string;
  subtitle?: string;
  helper?: string;
  onJoin?: () => void;
};

export function HeroCard({ title, subtitle, helper, onJoin }: HeroCardProps) {
  return (
    <section className="bg-white rounded-3xl shadow-lg overflow-hidden border border-purple-50">
      <div className="relative min-h-[220px] flex items-end">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_45%)]" />
        <div className="relative z-10 w-full p-6 flex flex-col gap-4 text-white">
          <div className="space-y-1">
            {helper && <p className="text-xs text-white/80">{helper}</p>}
            <h1 className="text-3xl font-semibold leading-tight drop-shadow">{title}</h1>
            {subtitle && <p className="text-sm text-white/80">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            <button className="h-11 w-11 rounded-full bg-white/90 text-purple-700 shadow hover:bg-white transition">
              <VideoCameraIcon className="h-5 w-5 mx-auto" />
            </button>
            <button className="h-11 w-11 rounded-full bg-white/90 text-purple-700 shadow hover:bg-white transition">
              <MicrophoneIcon className="h-5 w-5 mx-auto" />
            </button>
            <button
              onClick={onJoin}
              className="h-11 w-11 rounded-full border border-white/80 text-white hover:bg-white hover:text-purple-700 transition"
            >
              <PhoneIcon className="h-5 w-5 mx-auto" />
            </button>
            <button className="h-11 w-11 rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition">
              <PhoneXMarkIcon className="h-5 w-5 mx-auto" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
