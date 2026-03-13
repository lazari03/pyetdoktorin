'use client';

import type { DateOverride } from '@/domain/entities/DoctorAvailability';

type Props = {
  overrides: DateOverride[];
  onAdd: () => void;
  onChange: (index: number, next: DateOverride) => void;
  onRemove: (index: number) => void;
};

export default function DateOverridesEditor({ overrides, onAdd, onChange, onRemove }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-900">Date exceptions</p>
          <p className="text-sm text-slate-500">Block a specific day or open a custom one-off session window.</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Add override
        </button>
      </div>

      {overrides.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-500">
          No date overrides yet. Add one for vacations, holidays, or extra clinic hours.
        </div>
      ) : (
        <div className="space-y-3">
          {overrides.map((override, index) => {
            const slot = override.slots?.[0];
            return (
              <div key={`${override.date}-${index}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
                  <input
                    type="date"
                    value={override.date}
                    onChange={(event) =>
                      onChange(index, {
                        ...override,
                        date: event.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                  />

                  <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={override.blocked}
                      onChange={(event) =>
                        onChange(index, {
                          ...override,
                          blocked: event.target.checked,
                          slots: event.target.checked ? [] : override.slots?.length ? override.slots : [{ startTime: '09:00', endTime: '12:00' }],
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    Block day
                  </label>

                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-sm font-semibold text-rose-600 hover:text-rose-700"
                  >
                    Remove
                  </button>
                </div>

                {!override.blocked && (
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      type="time"
                      value={slot?.startTime || '09:00'}
                      onChange={(event) =>
                        onChange(index, {
                          ...override,
                          slots: [
                            {
                              startTime: event.target.value,
                              endTime: slot?.endTime || '12:00',
                            },
                          ],
                        })
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                    />
                    <input
                      type="time"
                      value={slot?.endTime || '12:00'}
                      onChange={(event) =>
                        onChange(index, {
                          ...override,
                          slots: [
                            {
                              startTime: slot?.startTime || '09:00',
                              endTime: event.target.value,
                            },
                          ],
                        })
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
