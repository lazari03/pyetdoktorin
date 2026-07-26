"use client";

import { useState } from "react";
import useSWR from "swr";
import { useTranslation } from "react-i18next";
import "@i18n";
import { ToastProvider, useToast } from "../components/ToastProvider";
import RequestStateGate from "@/presentation/components/RequestStateGate/RequestStateGate";
import { StatsPageSkeleton } from "@/presentation/components/Skeleton/StatsPageSkeleton";
import { useDI } from "@/context/DIContext";
import type { SupportTicketStatus } from "@/application/ports/ISupportTicketService";

function statusPill(status: SupportTicketStatus, t: (k: string) => string) {
  if (status === "resolved") return { label: t("ticketStatusResolved") || "Resolved", cls: "bg-green-50 text-green-700" };
  if (status === "in_progress") return { label: t("ticketStatusInProgress") || "In progress", cls: "bg-sky-50 text-sky-700" };
  return { label: t("ticketStatusOpen") || "Open", cls: "bg-amber-50 text-amber-700" };
}

function TicketsTable() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { listSupportTicketsUseCase, updateSupportTicketUseCase } = useDI();
  const { data, error, isLoading, mutate } = useSWR("admin-support-tickets", () => listSupportTicketsUseCase.execute());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: SupportTicketStatus) => {
    setSavingId(id);
    try {
      await updateSupportTicketUseCase.execute(id, { status });
      await mutate();
      showToast(t("ticketUpdated") || "Ticket updated.", "success");
    } catch {
      showToast(t("ticketUpdateFailed") || "Failed to update ticket.", "error");
    } finally {
      setSavingId(null);
    }
  };

  const tickets = data ?? [];

  return (
    <RequestStateGate
      loading={isLoading}
      error={error}
      onRetry={() => mutate()}
      loadingLabel={t("loading")}
      analyticsPrefix="admin.tickets"
      skeleton={<StatsPageSkeleton cardCount={3} />}
    >
      <div className="space-y-3">
        <div>
          <h1 className="text-[15px] font-bold text-gray-900">{t("supportTickets") || "Support tickets"}</h1>
          <p className="text-[12.5px] text-gray-500">
            {t("supportTicketsSubtitle") || "Messages sent by users through the Help section."}
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          {tickets.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">
              {t("noSupportTickets") || "No support tickets yet."}
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {tickets.map((ticket) => {
                const pill = statusPill(ticket.status, t);
                const expanded = expandedId === ticket.id;
                return (
                  <div key={ticket.id}>
                    <button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : ticket.id)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50/60 transition-colors"
                      data-analytics="admin.tickets.toggle"
                    >
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-semibold text-gray-900 truncate">{ticket.subject}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {ticket.userName} · {ticket.userEmail} · {ticket.userRole} · {ticket.topic} ·{" "}
                          {new Date(ticket.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold shrink-0 ${pill.cls}`}>
                        {pill.label}
                      </span>
                    </button>
                    {expanded && (
                      <div className="px-4 pb-4 space-y-3">
                        <p className="text-[12.5px] text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg px-3 py-2.5">
                          {ticket.message}
                        </p>
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-semibold text-gray-500">
                            {t("ticketStatusLabel") || "Status"}
                          </label>
                          <select
                            value={ticket.status}
                            disabled={savingId === ticket.id}
                            onChange={(e) => handleStatusChange(ticket.id, e.target.value as SupportTicketStatus)}
                            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-purple-300"
                          >
                            <option value="open">{t("ticketStatusOpen") || "Open"}</option>
                            <option value="in_progress">{t("ticketStatusInProgress") || "In progress"}</option>
                            <option value="resolved">{t("ticketStatusResolved") || "Resolved"}</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </RequestStateGate>
  );
}

export default function AdminTicketsPage() {
  return (
    <ToastProvider>
      <TicketsTable />
    </ToastProvider>
  );
}
