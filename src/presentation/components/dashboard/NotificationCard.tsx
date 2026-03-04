'use client';

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Appointment } from "@/domain/entities/Appointment";
import { getAppointmentStatusPresentation } from "@/presentation/utils/getAppointmentStatusPresentation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getRoleNotificationsPath } from "@/navigation/roleRoutes";
import { UserRole } from "@/domain/entities/UserRole";
import { BellIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

type Props = {
  appointments: Appointment[];
};

export function NotificationCard({ appointments }: Props) {
  const { t } = useTranslation();
  const { role, user } = useAuth();
  const notificationsHref = getRoleNotificationsPath(role) || "/dashboard/notifications";

  const items = useMemo(() => {
    return [...appointments]
      .filter((a) => {
        if (user?.uid && a.dismissedBy?.[user.uid]) return false;
        if (role === UserRole.Doctor) return a.status?.toLowerCase() === "pending";
        return true;
      })
      .sort((a, b) => {
        const at = Number.isFinite(new Date(a.createdAt).getTime()) ? new Date(a.createdAt).getTime() : 0;
        const bt = Number.isFinite(new Date(b.createdAt).getTime()) ? new Date(b.createdAt).getTime() : 0;
        return bt - at;
      })
      .slice(0, 20) // keep payload light
      .map((a) => {
        const status = getAppointmentStatusPresentation(a.status);
        const createdAt = new Date(a.createdAt);
        const createdLabel = Number.isNaN(createdAt.getTime())
          ? `${a.preferredDate || ""} ${a.preferredTime || ""}`.trim()
          : createdAt.toLocaleString(undefined, {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            });
        const title =
          a.status?.toLowerCase() === "accepted"
            ? t("notificationAccepted", { doctor: a.doctorName || t("doctor") })
            : a.status?.toLowerCase() === "rejected"
            ? t("notificationRejected", { doctor: a.doctorName || t("doctor") })
            : t("notificationPending", { doctor: a.doctorName || t("doctor") });
        const desc = a.appointmentType ? `${a.appointmentType}` : "";
        const normalizedStatus = (a.status || "").toString().trim().toLowerCase();
        return { id: a.id, title, desc, ts: createdLabel, status, normalizedStatus };
      });
  }, [appointments, role, t, user?.uid]);

  const getTone = (normalizedStatus: string) => {
    switch (normalizedStatus) {
      case "accepted":
        return {
          dot: "bg-emerald-500",
          pill: "border-emerald-200 bg-emerald-50 text-emerald-700",
        };
      case "rejected":
      case "declined":
      case "canceled":
      case "cancelled":
        return {
          dot: "bg-rose-500",
          pill: "border-rose-200 bg-rose-50 text-rose-700",
        };
      case "completed":
      case "finished":
        return {
          dot: "bg-indigo-500",
          pill: "border-indigo-200 bg-indigo-50 text-indigo-700",
        };
      case "pending":
        return {
          dot: "bg-amber-500",
          pill: "border-amber-200 bg-amber-50 text-amber-700",
        };
      default:
        return {
          dot: "bg-gray-400",
          pill: "border-gray-200 bg-gray-50 text-gray-700",
        };
    }
  };

  return (
    <section className="card-premium card-premium-hover p-4 sm:p-5 flex flex-col gap-4 h-full min-h-[260px]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="mt-0.5 rounded-full bg-purple-50 p-2 border border-purple-100">
            <BellIcon className="h-4 w-4 text-purple-700" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{t("notifications") || "Notifications"}</p>
              <span
                className="shrink-0 inline-flex items-center rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-700"
                aria-label={t("notificationsCount") || "Notifications count"}
                data-analytics="dashboard.notifications.count"
              >
                {items.length}
              </span>
            </div>
            <p className="text-xs text-gray-500">{t("notificationsSubtitle") || "Latest updates and actions."}</p>
          </div>
        </div>

        <Link
          href={notificationsHref}
          className="shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-purple-700 hover:border-purple-200 hover:bg-purple-50 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
          aria-label={t("viewAll") || "View all notifications"}
          data-analytics="dashboard.notifications.view_all"
        >
          {t("viewAll") || "View all"}
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-gray-50/70 overflow-auto" style={{ maxHeight: "360px" }}>
        {items.length === 0 && (
          <div className="py-4 px-4 text-xs text-gray-500 flex items-center gap-2">
            <BellIcon className="h-4 w-4 text-gray-400" />
            {t("noNotifications") || "No notifications yet."}
          </div>
        )}
        {items.map((item) => {
          const tone = getTone(item.normalizedStatus);
          return (
            <Link
              key={item.id}
              href={`${notificationsHref}?focus=${encodeURIComponent(item.id)}`}
              className="group bg-white px-4 py-3 flex items-start gap-3 border-b border-gray-100 hover:bg-purple-50/40 transition cursor-pointer last:border-b-0"
              aria-label={t("openNotification") || "Open notification"}
              data-analytics="dashboard.notifications.open"
              data-analytics-id={item.id}
            >
              <div className={`mt-1 h-2.5 w-2.5 rounded-full ${tone.dot} ring-2 ring-white`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                {item.desc && <p className="text-xs text-gray-600 truncate">{item.desc}</p>}
                <p className="text-[11px] text-gray-500 mt-1">{item.ts || t("unknown")}</p>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${tone.pill}`}>
                {t(item.status.label)}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
