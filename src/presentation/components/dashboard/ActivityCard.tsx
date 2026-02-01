import React from "react";

type Stat = { label: string; value: string };

type ActivityCardProps = {
  score: number;
  stats: Stat[];
  note?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function ActivityCard({ score, stats, note, actionLabel, onAction }: ActivityCardProps) {
  return (
    <section className="bg-white rounded-3xl shadow-lg p-5 border border-purple-50 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900">Activity score</p>
          <div className="space-y-1 text-sm text-gray-800">
            {stats.map((s) => (
              <div key={s.label} className="flex justify-between w-52">
                <span className="text-gray-500">{s.label}</span>
                <span className="font-semibold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div
          className="relative h-24 w-24"
          aria-label="Activity gauge"
          style={{ background: `conic-gradient(#22c55e 0% ${score}%, #e5e7eb ${score}% 100%)` }}
        >
          <div className="absolute inset-3 rounded-full bg-white flex items-center justify-center text-sm font-semibold text-gray-900">
            {score}%
          </div>
        </div>
      </div>

      {note && (
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-3 text-sm text-gray-800">
          <p>{note}</p>
          {actionLabel && (
            <button className="text-purple-600 font-semibold text-xs mt-2 hover:underline" onClick={onAction}>
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
