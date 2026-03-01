import { PhoneIcon, CreditCardIcon, UserIcon, ClockIcon } from "@heroicons/react/24/outline";
import React from "react";
import { z } from "@/config/zIndex";

type HeroCardProps = {
  title: string;
  subtitle?: string;
  helper?: string;
  onJoin?: () => void;
  onPay?: () => void;
  onViewProfile?: () => void;
  isPaid?: boolean;
  isProcessing?: boolean;
  isWaiting?: boolean;
  ctaLabel?: string;
  payLabel?: string;
  processingLabel?: string;
  waitingLabel?: string;
  profileLabel?: string;
};

export function HeroCard({
  title,
  subtitle,
  helper,
  onJoin,
  onPay,
  onViewProfile,
  isPaid,
  isProcessing = false,
  isWaiting = false,
  ctaLabel = "Join now",
  payLabel = "Pay now",
  processingLabel = "Processing payment",
  waitingLabel = "Waiting for approval",
  profileLabel = "View doctor",
}: HeroCardProps) {
  const showProcessing = Boolean(isProcessing);
  const showWaiting = Boolean(isWaiting && !showProcessing);
  const showPay = Boolean(onPay && isPaid === false && !showWaiting && !showProcessing);
  const showJoin = Boolean(onJoin && !showPay && !showWaiting && !showProcessing);

  return (
    <section className="bg-white rounded-3xl shadow-lg overflow-hidden border border-purple-50">
      <div className="relative min-h-[220px] flex items-end">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_45%)]" />
        <div className={`relative ${z.absoluteContent} w-full p-6 flex flex-col gap-4 text-white`}>
          <div className="space-y-1">
            {helper && <p className="text-xs text-white/80">{helper}</p>}
            <h1 className="text-3xl font-semibold leading-tight drop-shadow">{title}</h1>
            {subtitle && <p className="text-sm text-white/80">{subtitle}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {showJoin && (
              <button
                onClick={onJoin}
                className="inline-flex items-center gap-2 rounded-full bg-white text-purple-700 px-4 py-2 text-sm font-semibold shadow hover:bg-purple-50 transition"
              >
                <PhoneIcon className="h-4 w-4" />
                {ctaLabel}
              </button>
            )}
            {showProcessing && (
              <button
                className="inline-flex items-center gap-2 rounded-full bg-white/80 text-purple-700 px-4 py-2 text-sm font-semibold shadow cursor-wait"
                disabled
              >
                <span className="h-4 w-4 animate-spin rounded-full border border-purple-400 border-t-transparent" />
                {processingLabel}
              </button>
            )}
            {showWaiting && (
              <button
                className="inline-flex items-center gap-2 rounded-full bg-white/20 text-white px-4 py-2 text-sm font-semibold shadow cursor-not-allowed"
                disabled
              >
                <ClockIcon className="h-4 w-4" />
                {waitingLabel}
              </button>
            )}
            {showPay && (
              <button
                onClick={onPay}
                className="inline-flex items-center gap-2 rounded-full border border-white/80 text-white px-4 py-2 text-sm font-semibold hover:bg-white hover:text-purple-700 transition"
              >
                <CreditCardIcon className="h-4 w-4" />
                {payLabel}
              </button>
            )}
            {onViewProfile && (
              <button
                onClick={onViewProfile}
                className="inline-flex items-center gap-2 rounded-full bg-white/20 text-white px-4 py-2 text-sm font-semibold hover:bg-white/30 transition"
              >
                <UserIcon className="h-4 w-4" />
                {profileLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
