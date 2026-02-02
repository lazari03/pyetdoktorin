import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Appointment } from "@/domain/entities/Appointment";
import { getAppointmentStatusPresentation } from "@/presentation/utils/getAppointmentStatusPresentation";
import Link from "next/link";

type Props = {
  appointments: Appointment[];
};

export function NotificationCard({ appointments }: Props) {
  const { t } = useTranslation();

  const items = useMemo(() => {
    return [...appointments]
      .slice(0, 20) // keep payload light
      .map((a) => {
        const status = getAppointmentStatusPresentation(a.status);
        const ts = `${a.preferredDate || ""} ${a.preferredTime || ""}`.trim();
        const title =
          a.status?.toLowerCase() === "accepted"
            ? t("notificationAccepted", { doctor: a.doctorName || t("doctor") })
            : a.status?.toLowerCase() === "rejected"
            ? t("notificationRejected", { doctor: a.doctorName || t("doctor") })
            : t("notificationPending", { doctor: a.doctorName || t("doctor") });
        const desc = a.appointmentType ? `${a.appointmentType}` : "";
        return { id: a.id, title, desc, ts, status };
      });
  }, [appointments, t]);

  return (
    <section className="bg-white rounded-3xl shadow-lg p-5 border border-purple-50 flex flex-col gap-3 h-full min-h-[260px]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">{t("notifications") || "Notifications"}</p>
        </div>
        <Link
          href="/dashboard/notifications"
          className="text-xs font-semibold text-purple-600 hover:text-purple-700"
          aria-label={t("viewAll") || "View all notifications"}
        >
          {t("viewAll") || "View all"}
        </Link>
      </div>

      <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-gray-50/60 overflow-hidden max-h-[320px] min-h-[260px]">
        {items.length === 0 && (
          <div className="py-4 px-4 text-xs text-gray-500">{t("noNotifications") || "No notifications yet."}</div>
        )}
        {items.map((item) => (
          <div key={item.id} className="px-4 py-3 flex items-start gap-3 bg-white hover:bg-gray-50 transition">
            <div
              className={`mt-1 h-2.5 w-2.5 rounded-full ${
                item.status.color?.includes("green")
                  ? "bg-green-500"
                  : item.status.color?.includes("red")
                  ? "bg-red-500"
                  : "bg-yellow-500"
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
              {item.desc && <p className="text-xs text-gray-600 truncate">{item.desc}</p>}
              <p className="text-[11px] text-gray-500 mt-0.5">{item.ts || t("unknown")}</p>
            </div>
            <span className={`text-[11px] font-semibold ${item.status.color}`}>{t(item.status.label)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
