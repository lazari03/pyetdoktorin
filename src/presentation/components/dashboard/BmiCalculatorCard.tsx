"use client";

import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CalculatorIcon } from "@heroicons/react/24/outline";

type BmiCategory = "underweight" | "normal" | "overweight" | "obese";

function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "normal";
  if (bmi < 30) return "overweight";
  return "obese";
}

const categoryStyles: Record<BmiCategory, { bg: string; text: string; bar: string }> = {
  underweight: { bg: "bg-blue-50", text: "text-blue-700", bar: "bg-blue-400" },
  normal: { bg: "bg-green-50", text: "text-green-700", bar: "bg-green-500" },
  overweight: { bg: "bg-yellow-50", text: "text-yellow-700", bar: "bg-yellow-500" },
  obese: { bg: "bg-red-50", text: "text-red-700", bar: "bg-red-500" },
};

export function BmiCalculatorCard() {
  const { t } = useTranslation();
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const bmi = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) return null;
    const heightM = h / 100;
    return w / (heightM * heightM);
  }, [height, weight]);

  const category = bmi ? getBmiCategory(bmi) : null;
  const style = category ? categoryStyles[category] : null;

  // Bar width: map BMI 10–40 to 0–100%
  const barPercent = bmi ? Math.min(100, Math.max(0, ((bmi - 10) / 30) * 100)) : 0;

  return (
    <section className="bg-white rounded-2xl shadow-md border border-purple-50 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-purple-50 px-5 py-3 flex items-center gap-2 border-b border-purple-100">
        <CalculatorIcon className="h-4 w-4 text-purple-600" />
        <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
          {t("bmiCalculator")}
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-3 p-5">
        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
              {t("heightCm")}
            </label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="170"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
              {t("weightKg")}
            </label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="70"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-colors"
            />
          </div>
        </div>

        {/* Result */}
        {bmi && style && category ? (
          <div className="flex flex-col gap-2 mt-auto">
            {/* BMI value */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] text-gray-500 uppercase tracking-wide font-semibold">
                  {t("yourBmi")}
                </p>
                <p className="text-2xl font-extrabold text-gray-900">{bmi.toFixed(1)}</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${style.bg} ${style.text}`}>
                {t(`bmi_${category}`)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="relative h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${style.bar}`}
                style={{ width: `${barPercent}%` }}
              />
            </div>

            {/* Scale labels */}
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-gray-400 text-center">
              {t("bmiEnterValues")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
