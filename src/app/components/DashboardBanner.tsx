"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";

interface DashboardBannerProps {
  href?: string;
}

export default function DashboardBanner({ href = "/dashboard/appointments" }: DashboardBannerProps) {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden rounded-3xl mb-6 shadow-sm border border-slate-100 bg-slate-900/5">
      {/* Full background image */}
      <div className="absolute inset-0">
        <Image
          src="/img/dashboard-doctor-hero.jpg"
          alt={t("bannerDoctorAlt") ?? "Doctor on a video consultation"}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/20 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 via-slate-900/20 to-transparent" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 px-5 py-7 sm:px-8 sm:py-9 lg:px-12 lg:py-12 flex flex-col gap-4 sm:gap-5 max-w-xl">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white leading-snug">
          {t("bannerTitle") ?? "Your next video visit, at your fingertips"}
        </h2>
        <p className="text-sm sm:text-base text-slate-100/85">
          {t("bannerSubtitle") ??
            "Join calls, review prescriptions, and keep all your appointments in one calm, organized dashboard."}
        </p>
        <div className="mt-2">
          <Link
            href={href}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors"
          >
            {t("bannerCta") ?? "View appointments"}
          </Link>
        </div>
      </div>
    </section>
  );
}
