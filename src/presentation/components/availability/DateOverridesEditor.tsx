'use client';

import { PlusIcon } from '@heroicons/react/24/solid';
import type { DateOverride } from '@/domain/entities/DoctorAvailability';
import { useTranslation } from 'react-i18next';

type Props = {
  overrides: DateOverride[];
  onAdd: () => void;
  onChange: (index: number, next: DateOverride) => void;
  onRemove: (index: number) => void;
};

export default function DateOverridesEditor({ overrides, onAdd, onChange, onRemove }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-md">
          <p className="text-sm font-medium text-slate-900">
            {t('availabilityDateExceptions', { defaultValue: 'Date exceptions' })}
          </p>
          <p className="text-sm text-slate-500">
            {t('availabilityDateExceptionsHint', {
              defaultValue: 'Block a specific day or open a custom one-off session window.',
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="group inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full border border-purple-200 bg-gradient-to-r from-purple-600 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_-18px_rgba(126,34,206,0.95)] transition-all hover:-translate-y-0.5 hover:from-purple-500 hover:to-violet-500 hover:shadow-[0_20px_34px_-18px_rgba(139,92,246,0.88)] focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-offset-2 sm:w-auto sm:self-start"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 ring-1 ring-inset ring-white/25 transition-transform group-hover:scale-105">
            <PlusIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span className="whitespace-nowrap">
            {t('availabilityAddOverride', { defaultValue: 'Add override' })}
          </span>
        </button>
      </div>

      {overrides.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-purple-200 bg-purple-50/50 px-5 py-6 text-sm text-slate-500">
          {t('availabilityNoOverrides', {
            defaultValue: 'No date overrides yet. Add one for vacations, holidays, or extra clinic hours.',
          })}
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
                    aria-label={t('availabilityDate', { defaultValue: 'Date' })}
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
                      className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    {t('availabilityBlockDay', { defaultValue: 'Block day' })}
                  </label>

                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-sm font-semibold text-rose-600 hover:text-rose-700"
                  >
                    {t('availabilityRemoveOverride', { defaultValue: 'Remove' })}
                  </button>
                </div>

                {!override.blocked && (
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      type="time"
                      value={slot?.startTime || '09:00'}
                      aria-label={t('availabilityStartTime', {
                        defaultValue: 'Start time',
                      })}
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
                      aria-label={t('availabilityEndTime', {
                        defaultValue: 'End time',
                      })}
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
