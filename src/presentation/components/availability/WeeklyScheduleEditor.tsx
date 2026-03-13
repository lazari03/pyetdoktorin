'use client';

import type { DoctorAvailability } from '@/domain/entities/DoctorAvailability';

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type Props = {
  availability: DoctorAvailability;
  onChangeDay: (
    day: number,
    patch: { enabled: boolean; startTime: string; endTime: string },
  ) => void;
  onSlotDurationChange: (value: number) => void;
  onBufferChange: (value: number) => void;
};

export default function WeeklyScheduleEditor({
  availability,
  onChangeDay,
  onSlotDurationChange,
  onBufferChange,
}: Props) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-700">
          <span className="mb-2 block font-medium">Visit length</span>
          <select
            value={availability.slotDurationMinutes}
            onChange={(event) => onSlotDurationChange(Number(event.target.value))}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
          >
            {[15, 20, 30, 45, 60].map((value) => (
              <option key={value} value={value}>
                {value} minutes
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-slate-700">
          <span className="mb-2 block font-medium">Buffer between visits</span>
          <select
            value={availability.bufferMinutes}
            onChange={(event) => onBufferChange(Number(event.target.value))}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
          >
            {[0, 5, 10, 15, 20].map((value) => (
              <option key={value} value={value}>
                {value} minutes
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-3">
        {DAY_LABELS.map((label, day) => {
          const slot = availability.weeklySchedule.find((entry) => entry.day === day);
          return (
            <div
              key={label}
              className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1.1fr_0.8fr_0.8fr]"
            >
              <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={Boolean(slot)}
                  onChange={(event) =>
                    onChangeDay(day, {
                      enabled: event.target.checked,
                      startTime: slot?.startTime || '09:00',
                      endTime: slot?.endTime || '17:00',
                    })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                {label}
              </label>

              <input
                type="time"
                value={slot?.startTime || '09:00'}
                disabled={!slot}
                onChange={(event) =>
                  onChangeDay(day, {
                    enabled: true,
                    startTime: event.target.value,
                    endTime: slot?.endTime || '17:00',
                  })
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 disabled:bg-slate-100"
              />

              <input
                type="time"
                value={slot?.endTime || '17:00'}
                disabled={!slot}
                onChange={(event) =>
                  onChangeDay(day, {
                    enabled: true,
                    startTime: slot?.startTime || '09:00',
                    endTime: event.target.value,
                  })
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 disabled:bg-slate-100"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
