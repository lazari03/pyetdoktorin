import React from "react";
import { useTranslation } from "react-i18next";
import { PhoneIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";

const EMERGENCY_NUMBER = "127";

export function EmergencyCard() {
  const { t } = useTranslation();

  return (
    <section className="bg-white rounded-2xl shadow-md border border-purple-50 h-full flex flex-col overflow-hidden">
      {/* Header strip */}
      <div className="bg-red-50 px-5 py-3 flex items-center gap-2 border-b border-red-100">
        <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
        <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
          {t("emergencyServices")}
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-5">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
          <PhoneIcon className="h-7 w-7 text-red-500" />
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-gray-900">
            {t("ambulanceAlbania")}
          </p>
          <p className="text-3xl font-extrabold text-red-600 tracking-wider">
            {EMERGENCY_NUMBER}
          </p>
          <p className="text-[11px] text-gray-500">
            {t("emergencyAvailable")}
          </p>
        </div>

        <a
          href={`tel:${EMERGENCY_NUMBER}`}
          className="mt-1 inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 transition-colors"
        >
          <PhoneIcon className="h-4 w-4" />
          {t("callNow")}
        </a>
      </div>
    </section>
  );
}
