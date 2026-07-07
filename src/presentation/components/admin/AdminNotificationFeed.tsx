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
  info: { icon: InformationCircleIcon, color: "text-blue-700", bg: "bg-blue-100" },
  success: { icon: CheckCircleIcon, color: "text-green-700", bg: "bg-green-100" },
  warning: { icon: ExclamationTriangleIcon, color: "text-amber-700", bg: "bg-amber-100" },
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
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div>
          <p className="text-[13.5px] font-bold text-gray-900">{t("notifications") || "Notifications"}</p>
          <p className="text-[11px] text-gray-500">{t("notificationsSubtitle") || "Latest care updates and actions."}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", "action", "info"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                filter === f ? "bg-purple-600 text-white" : "border border-gray-200 text-gray-600 hover:border-purple-200"
              }`}
            >
              {t(f) || f}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-gray-100 divide-y divide-gray-100 overflow-auto" style={{ maxHeight: "420px" }}>
        {filtered.length === 0 && (
          <div className="py-6 px-4 text-[12.5px] text-gray-500 flex items-center justify-center gap-2">
            <BellIcon className="h-4 w-4 text-gray-400" />
            {t("noNotifications") || "No notifications yet."}
          </div>
        )}
        {filtered.map((n) => {
          const cfg = severityConfig[n.severity];
          const Icon = cfg.icon;
          return (
            <div key={n.id} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50/60 transition-colors">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bg} ${cfg.color}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-semibold text-gray-900 truncate">{n.title}</p>
                <p className="text-[11.5px] text-gray-600 truncate">{n.body}</p>
                <div className="text-[10.5px] text-gray-400 mt-1 flex flex-wrap gap-2">
                  {n.patient && <span>{t("patient")}: {n.patient}</span>}
                  {n.clinician && <span>{t("doctor")}: {n.clinician}</span>}
                  <span>{n.timestamp}</span>
                </div>
              </div>
              {n.needsAction && (
                <span className="shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold bg-amber-50 text-amber-700">
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
