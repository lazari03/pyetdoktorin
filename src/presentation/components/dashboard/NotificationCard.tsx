'use client';

import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Appointment } from "@/domain/entities/Appointment";
import { getAppointmentStatusPresentation } from "@/presentation/utils/getAppointmentStatusPresentation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getRoleNotificationsPath } from "@/navigation/roleRoutes";
import { UserRole } from "@/domain/entities/UserRole";
import { BellIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const STORAGE_KEY = "readNotificationIds";

function loadReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {}
}

type Props = {
  appointments: Appointment[];
};

export function NotificationCard({ appointments }: Props) {
  const { t } = useTranslation();
  const { role, user } = useAuth();
  const notificationsHref = getRoleNotificationsPath(role) || "/dashboard/notifications";
  const [readIds, setReadIds] = useState<Set<string>>(loadReadIds);

  const markRead = (id: string) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  };

  const filtered = useMemo(() => {
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
      });
  }, [appointments, role, user?.uid]);

  const items = useMemo(() => {
    return filtered
      .slice(0, 5) // show 5 latest only; "View all" links to the full list
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
  }, [filtered, t]);

  const getDotClass = (normalizedStatus: string) => {
    switch (normalizedStatus) {
      case "accepted":                          return "notif-dot notif-dot-unread-accepted";
      case "rejected":
      case "declined":
      case "canceled":
      case "cancelled":                         return "notif-dot notif-dot-unread-rejected";
      case "pending":                           return "notif-dot notif-dot-unread-pending";
      default:                                  return "notif-dot notif-dot-unread-default";
    }
  };

  const getPillClass = (normalizedStatus: string) => {
    switch (normalizedStatus) {
      case "accepted":                          return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "rejected":
      case "declined":
      case "canceled":
      case "cancelled":                         return "border-rose-200 bg-rose-50 text-rose-700";
      case "completed":
      case "finished":                          return "border-indigo-200 bg-indigo-50 text-indigo-700";
      case "pending":                           return "border-amber-200 bg-amber-50 text-amber-700";
      default:                                  return "border-gray-200 bg-gray-50 text-gray-700";
    }
  };

  const getTone = (normalizedStatus: string) => ({
    dot: getDotClass(normalizedStatus),
    pill: getPillClass(normalizedStatus),
  });

  const unreadCount = items.filter((i) => !readIds.has(i.id)).length;

  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12.5px] font-bold text-gray-900">{t("activity") || "Activity"}</p>
        {unreadCount > 0 && (
          <span
            className="shrink-0 inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700"
            aria-label={t("notificationsCount") || "Notifications count"}
            data-analytics="dashboard.notifications.count"
          >
            {unreadCount} {t("new") || "new"}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="py-4 text-[12px] text-gray-500 flex items-center gap-2">
          <BellIcon className="h-4 w-4 text-gray-400" />
          {t("noNotifications") || "No notifications yet."}
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          {items.map((item) => {
            const tone = getTone(item.normalizedStatus);
            return (
              <Link
                key={item.id}
                href={`${notificationsHref}?focus=${encodeURIComponent(item.id)}`}
                onClick={() => markRead(item.id)}
                className="flex gap-2.5 rounded-lg px-1 py-2 hover:bg-gray-50/80 transition-colors"
                aria-label={t("openNotification") || "Open notification"}
                data-analytics="dashboard.notifications.open"
                data-analytics-id={item.id}
              >
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${tone.dot}`} />
                <div className="min-w-0">
                  <p className="text-[12px] text-gray-700 leading-snug">{item.title}</p>
                  <p className="text-[10.5px] text-gray-400 mt-0.5">{item.ts || t("unknown")}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Link
        href={notificationsHref}
        className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-semibold text-purple-700 hover:text-purple-800"
        aria-label={t("viewAll") || "View all notifications"}
        data-analytics="dashboard.notifications.view_all"
      >
        {t("viewAll") || "View all"}
        <ChevronRightIcon className="h-3.5 w-3.5" />
      </Link>
    </section>
  );
}
