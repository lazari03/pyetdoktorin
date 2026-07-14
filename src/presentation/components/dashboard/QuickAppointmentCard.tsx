"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BoltIcon, ArrowRightIcon, ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { useDI } from "@/context/DIContext";
import { useToast } from "@/presentation/components/Toast/ToastProvider";
import { trackAnalyticsEvent } from "@/presentation/utils/trackAnalyticsEvent";
import type { DoctorMatch } from "@/domain/rules/quickMatchRules";

type Step = "idle" | "specialty" | "date" | "results";

// ponytail: no time picker — "closest available" means earliest slot on/after
// the chosen date, so we search from the start of the day
const EARLIEST_TIME = "00:00";

export function QuickAppointmentCard() {
  const { t } = useTranslation();
  const { quickMatchDoctorUseCase, createAppointmentUseCase, getSpecializationsUseCase } = useDI();
  const { toast } = useToast();

  const [specialties, setSpecialties] = useState<string[]>([]);
  const [step, setStep] = useState<Step>("idle");
  const [entered, setEntered] = useState(false);
  const [specialty, setSpecialty] = useState("");
  const [date, setDate] = useState("");
  const [matches, setMatches] = useState<DoctorMatch[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    getSpecializationsUseCase.execute().then(setSpecialties).catch(() => {});
  }, [getSpecializationsUseCase]);

  useEffect(() => {
    setEntered(false);
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [step]);

  const minDate = new Date().toISOString().split("T")[0];

  const reset = () => {
    setStep("idle");
    setSpecialty("");
    setDate("");
    setMatches(null);
    setBooked(false);
  };

  const search = async () => {
    setStep("results");
    setSearching(true);
    try {
      const result = await quickMatchDoctorUseCase.execute(specialty, date, EARLIEST_TIME);
      setMatches(result.slice(0, 3));
      setBooked(false);
      trackAnalyticsEvent("quick_appointment_searched", {
        specialty,
        matches: result.length,
      });
    } catch {
      toast({
        variant: "error",
        message: t("genericError") || "Something went wrong. Please try again.",
      });
      reset();
    } finally {
      setSearching(false);
    }
  };

  const book = async (match: DoctorMatch) => {
    setBookingId(match.doctor.id);
    try {
      await createAppointmentUseCase.execute({
        doctorId: match.doctor.id,
        doctorName: match.doctor.name,
        appointmentType: t("consultation") || "Consultation",
        preferredDate: match.date,
        preferredTime: format(new Date(`2000-01-01T${match.time}:00`), "hh:mm a"),
      });
      setBooked(true);
      trackAnalyticsEvent("quick_appointment_booked", {
        doctorId: match.doctor.id,
        distanceMinutes: match.distanceMinutes,
      });
    } catch {
      toast({
        variant: "error",
        message: t("genericError") || "Something went wrong. Please try again.",
      });
    } finally {
      setBookingId(null);
    }
  };

  const anim = `transition-all duration-200 ease-out ${entered ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]"}`;

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4">
      <div className="flex items-center gap-2.5 mb-3">
        {step !== "idle" && (
          <button
            type="button"
            onClick={reset}
            aria-label={t("cancel") || "Back"}
            className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </button>
        )}
        <span className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 bg-purple-50 text-purple-600">
          <BoltIcon className="h-4 w-4" />
        </span>
        <div key={step} className={`min-w-0 ${anim}`}>
          <p className="text-[13px] font-bold text-gray-900">
            {t("quickAppointmentTitle") || "Takimi i shpejt"}
          </p>
          <p className="text-[11.5px] text-gray-500 truncate">
            {step === "idle" &&
              (t("quickAppointmentHint") ||
                "Zgjidhni specialitetin dhe orarin — ju gjejmë mjekun më të mirë të disponueshëm.")}
            {step === "specialty" && (t("quickApptStepSpecialty") || "Cilin specialitet kërkoni?")}
            {step === "date" && (
              <>
                <span className="font-semibold text-purple-700">{specialty}</span>
                {" · "}
                {t("quickApptStepDate") || "Kur ju përshtatet?"}
              </>
            )}
            {step === "results" &&
              (searching
                ? t("quickApptSearching") || "Duke kërkuar mjekun më të afërt të lirë…"
                : `${specialty} · ${date}`)}
          </p>
        </div>
      </div>

      <div key={`field-${step}`} className={anim}>
        {step === "idle" && (
          <button
            type="button"
            onClick={() => setStep("specialty")}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
          >
            {t("go") || "Shko"}
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        )}

        {step === "specialty" && (
          <select
            autoFocus
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-900 outline-none transition-colors focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            value=""
            onChange={(e) => {
              if (!e.target.value) return;
              setSpecialty(e.target.value);
              setStep("date");
            }}
          >
            <option value="" disabled>
              {t("specialtyPlaceholder") || "Zgjidh specialitetin"}
            </option>
            {specialties.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}

        {step === "date" && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              autoFocus
              type="date"
              className="w-full flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-900 outline-none transition-colors focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              min={minDate}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <button
              type="button"
              onClick={search}
              disabled={!date}
              className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-40 disabled:hover:bg-purple-600"
            >
              {t("search") || "Kërko"}
            </button>
          </div>
        )}

        {step === "results" && (
          <div className="flex flex-col gap-2">
            {searching ? (
              [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3 animate-pulse"
                >
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="h-3 w-1/3 rounded bg-gray-200" />
                    <div className="h-2.5 w-1/2 rounded bg-gray-200" />
                    <div className="h-2.5 w-1/4 rounded bg-gray-200" />
                  </div>
                  <div className="h-8 w-20 rounded-lg bg-gray-200 shrink-0" />
                </div>
              ))
            ) : booked ? (
              <div className="flex flex-col items-center text-center gap-2 py-4">
                <CheckCircleIcon className="h-10 w-10 text-green-500" />
                <p className="text-sm font-semibold text-gray-900">
                  {t("quickApptBooked") ||
                    "Appointment requested — you'll be notified once the doctor accepts."}
                </p>
                <button type="button" className="btn btn-primary mt-2" onClick={reset}>
                  {t("confirm") || "OK"}
                </button>
              </div>
            ) : !matches || matches.length === 0 ? (
              <div className="flex flex-col items-center text-center gap-3 py-4">
                <p className="text-sm text-gray-600">
                  {t("noDoctorsForTime") ||
                    "No available doctors found in the next two weeks. Try another specialty."}
                </p>
                <button type="button" className="btn btn-primary" onClick={reset}>
                  {t("quickApptNewSearch") || "New search"}
                </button>
              </div>
            ) : (
              matches.map((m, i) => (
                <div
                  key={m.doctor.id}
                  className={`flex flex-col gap-2.5 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between ${
                    i === 0 ? "border-purple-200 bg-purple-50/60" : "border-gray-100 bg-gray-50/40"
                  }`}
                >
                  <div className="min-w-0">
                    {i === 0 && (
                      <p className="text-[10px] font-bold uppercase tracking-wide text-purple-600 mb-0.5">
                        {t("bestMatch") || "Best match"}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-gray-900 truncate">{m.doctor.name}</p>
                    <p className="text-xs text-gray-500 truncate">{m.doctor.specialization.join(", ")}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {m.date} · {m.time}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary w-full shrink-0 sm:w-auto"
                    disabled={bookingId !== null}
                    onClick={() => book(m)}
                  >
                    {bookingId === m.doctor.id ? t("loading") || "Loading..." : t("bookNow") || "Book now"}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}
