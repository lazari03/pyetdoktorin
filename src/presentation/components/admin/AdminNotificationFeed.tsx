import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BellIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

type Severity = "info" | "success" | "warning";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  patient?: string;
  clinician?: string;
  timestamp: string;
  severity: Severity;
  needsAction?: boolean;
};

type Props = {
  items?: NotificationItem[];
  onViewAll?: () => void;
};

const severityConfig: Record<Severity, { icon: React.ElementType; color: string; bg: string }> = {
  info: { icon: InformationCircleIcon, color: "text-blue-700", bg: "bg-blue-50" },
  success: { icon: CheckCircleIcon, color: "text-green-700", bg: "bg-green-50" },
  warning: { icon: ExclamationTriangleIcon, color: "text-amber-700", bg: "bg-amber-50" },
};

export function AdminNotificationFeed({ items }: Props) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<"all" | "action" | "info">("all");

  const data = useMemo(() => items ?? [], [items]);

  const filtered = useMemo(() => {
    if (filter === "action") return data.filter((n) => n.needsAction || n.severity === "warning");
    if (filter === "info") return data.filter((n) => n.severity === "info");
    return data;
  }, [data, filter]);

  return (
    <section className="bg-white rounded-3xl shadow-lg border border-purple-50 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">{t("notifications") || "Notifications"}</p>
          <p className="text-xs text-gray-500">{t("notificationsSubtitle") || "Latest care updates and actions."}</p>
        </div>
        <div className="flex items-center gap-2">
          {["all", "action", "info"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as "all" | "action" | "info")}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition ${
                filter === f ? "border-purple-500 text-purple-700 bg-purple-50" : "border-gray-200 text-gray-600 hover:border-purple-300"
              }`}
            >
              {t(f) || f}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-gray-50/70 overflow-auto" style={{ maxHeight: "420px" }}>
        {filtered.length === 0 && (
          <div className="py-4 px-4 text-xs text-gray-500 flex items-center gap-2">
            <BellIcon className="h-4 w-4 text-gray-400" />
            {t("noNotifications") || "No notifications yet."}
          </div>
        )}
        {filtered.map((n) => {
          const cfg = severityConfig[n.severity];
          const Icon = cfg.icon;
          return (
            <div key={n.id} className="bg-white px-4 py-3 flex items-start gap-3 border-b border-gray-100">
              <div className={`mt-1 p-1.5 rounded-full ${cfg.bg}`}>
                <Icon className={`h-4 w-4 ${cfg.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{n.title}</p>
                <p className="text-xs text-gray-600 truncate">{n.body}</p>
                <div className="text-[11px] text-gray-500 mt-1 flex flex-wrap gap-2">
                  {n.patient && <span>{t("patient")}: {n.patient}</span>}
                  {n.clinician && <span>{t("doctor")}: {n.clinician}</span>}
                  <span>{n.timestamp}</span>
                </div>
              </div>
              {n.needsAction && (
                <span className="text-[11px] font-semibold text-amber-700 px-2 py-1 rounded-full bg-amber-50 border border-amber-100">
                  {t("needsAction") || "Needs action"}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
