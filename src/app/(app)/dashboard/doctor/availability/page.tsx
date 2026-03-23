'use client';

import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useManageAvailability } from '@/presentation/hooks/useManageAvailability';
import SmartAvailabilityPresets from '@/presentation/components/availability/SmartAvailabilityPresets';
import WeeklyScheduleEditor from '@/presentation/components/availability/WeeklyScheduleEditor';
import DateOverridesEditor from '@/presentation/components/availability/DateOverridesEditor';
import { toIntlLocale } from '@/presentation/utils/availabilityPresentation';

export default function DoctorAvailabilityPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const {
    availability,
    loading,
    saving,
    error,
    savedAt,
    presets,
    summary,
    applyPreset,
    updateWeeklyDay,
    setSlotDurationMinutes,
    setBufferMinutes,
    addOverride,
    updateOverride,
    removeOverride,
    save,
  } = useManageAvailability(user?.uid ?? null);
  const intlLocale = toIntlLocale(i18n.resolvedLanguage);

  if (loading || !availability) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-500 shadow-sm">
          {t('loadingAvailability', { defaultValue: 'Loading smart availability...' })}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-purple-100/80">
          <p className="text-sm font-medium text-purple-700">
            {t('availabilityEyebrow', { defaultValue: 'Smart availability' })}
          </p>
          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                {t('manageAvailability', {
                  defaultValue: 'Manage your smart availability',
                })}
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {t('availabilityDescription', {
                  defaultValue:
                    'Choose a preset, refine your weekly rhythm, and set one-off exceptions. Patients will only see times that fit your real working pattern.',
                })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="rounded-full bg-gradient-to-r from-purple-600 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_-18px_rgba(126,34,206,0.95)] transition hover:from-purple-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? t('saving', { defaultValue: 'Saving...' })
                : t('saveAvailability', { defaultValue: 'Save availability' })}
            </button>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="rounded-full bg-purple-50 px-4 py-2 font-medium text-purple-700 ring-1 ring-purple-100">
              {summary.weeklyCapacity}{' '}
              {t('weeklySlots', { defaultValue: 'weekly slots' })}
            </span>
            <span className="rounded-full bg-slate-100 px-4 py-2">
              {t('openDays', { defaultValue: 'Open days' })}:{' '}
              {summary.openDays || t('none', { defaultValue: 'None' })}
            </span>
            {savedAt && (
              <span className="rounded-full bg-slate-100 px-4 py-2">
                {t('lastUpdated', { defaultValue: 'Last updated' })}:{' '}
                {new Intl.DateTimeFormat(intlLocale, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(savedAt))}
              </span>
            )}
          </div>
          {error && (
            <div className="mt-5 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-6">
            <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-purple-100/80">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  {t('smartPresets', { defaultValue: 'Smart presets' })}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t('smartPresetsHint', {
                    defaultValue:
                      'Start from a clinically sensible template, then fine-tune it for your practice.',
                  })}
                </p>
              </div>
              <SmartAvailabilityPresets
                presets={presets}
                activePresetId={availability.presetId}
                onApply={applyPreset}
              />
            </section>

            <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-purple-100/80">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  {t('weeklySchedule', { defaultValue: 'Weekly schedule' })}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t('weeklyScheduleHint', {
                    defaultValue:
                      'Keep your weekly pattern simple and consistent. Smart slots are generated from these hours.',
                  })}
                </p>
              </div>
              <WeeklyScheduleEditor
                availability={availability}
                onChangeDay={updateWeeklyDay}
                onSlotDurationChange={setSlotDurationMinutes}
                onBufferChange={setBufferMinutes}
              />
            </section>
          </div>

          <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-purple-100/80">
            <DateOverridesEditor
              overrides={availability.dateOverrides}
              onAdd={addOverride}
              onChange={updateOverride}
              onRemove={removeOverride}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
