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
    <section className="rounded-lg overflow-hidden shadow-sm">
      <div className="relative flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_50%)]" />
        <div className={`relative ${z.absoluteContent} w-full p-5 sm:p-6 flex flex-col gap-3 text-white`}>
          <div className="space-y-1">
            {helper && <p className="text-[11px] uppercase tracking-wide font-semibold text-white/70">{helper}</p>}
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{title}</h1>
            {subtitle && <p className="text-sm text-white/80 leading-snug">{subtitle}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {showJoin && (
              <button
                onClick={onJoin}
                className="inline-flex items-center gap-2 rounded-lg bg-white text-purple-700 px-4 py-2 text-sm font-semibold shadow hover:bg-purple-100 hover:text-purple-800 transition-colors"
              >
                <PhoneIcon className="h-4 w-4" />
                {ctaLabel}
              </button>
            )}
            {showProcessing && (
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-white/80 text-purple-700 px-4 py-2 text-sm font-semibold shadow cursor-wait"
                disabled
              >
                <span className="h-4 w-4 animate-spin rounded-full border border-purple-400 border-t-transparent" />
                {processingLabel}
              </button>
            )}
            {showWaiting && (
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-white/20 text-white px-4 py-2 text-sm font-semibold cursor-not-allowed"
                disabled
              >
                <ClockIcon className="h-4 w-4" />
                {waitingLabel}
              </button>
            )}
            {showPay && (
              <button
                onClick={onPay}
                className="inline-flex items-center gap-2 rounded-lg border border-white/80 text-white px-4 py-2 text-sm font-semibold hover:bg-white hover:text-purple-700 transition-colors"
              >
                <CreditCardIcon className="h-4 w-4" />
                {payLabel}
              </button>
            )}
            {onViewProfile && (
              <button
                onClick={onViewProfile}
                className="inline-flex items-center gap-2 rounded-lg bg-white/15 text-white px-4 py-2 text-sm font-semibold hover:bg-white/30 transition-colors"
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
