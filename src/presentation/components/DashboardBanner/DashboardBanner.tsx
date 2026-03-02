"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { DASHBOARD_PATHS } from "@/navigation/paths";

interface DashboardBannerProps {
  href?: string;
}

const bannerImageUrl = "/api/images?key=dashboard";

export default function DashboardBanner({ href = DASHBOARD_PATHS.appointments }: DashboardBannerProps) {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden rounded-3xl mb-6 shadow-sm border border-slate-100 bg-slate-900/5">
      {/* Full background image */}
      <div className="absolute inset-0">
        <Image
          src={bannerImageUrl}
          alt={t("bannerDoctorAlt")}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/20 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 via-slate-900/20 to-transparent" />
      </div>

      {/* Content overlay */}
      <div className="relative px-5 py-7 sm:px-8 sm:py-9 lg:px-12 lg:py-12 flex flex-col gap-4 sm:gap-5 max-w-xl">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white leading-snug">
          {t("bannerTitle")}
        </h2>
        <p className="text-sm sm:text-base text-slate-100/85">
          {t("bannerSubtitle")}
        </p>
        <div className="mt-2">
          <Link href={href} className="inline-block rounded-full bg-purple-500 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-purple-600 transition-colors">
            {t("bannerCta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
