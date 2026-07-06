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
        <div className="rounded-xl border border-gray-100 bg-white px-6 py-5 text-[12.5px] text-gray-500 shadow-sm">
          {t('loadingAvailability', { defaultValue: 'Loading smart availability...' })}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full px-4 py-6">
      <div className="mx-auto max-w-6xl space-y-3">
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-[.13em] text-purple-600">
            {t('availabilityEyebrow', { defaultValue: 'Smart availability' })}
          </p>
          <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-[15px] font-bold text-gray-900">
                {t('manageAvailability', {
                  defaultValue: 'Manage your smart availability',
                })}
              </h1>
              <p className="mt-1 text-[12.5px] text-gray-500">
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
              className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? t('saving', { defaultValue: 'Saving...' })
                : t('saveAvailability', { defaultValue: 'Save availability' })}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-[11.5px] text-gray-600">
            <span className="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold bg-purple-50 text-purple-700">
              {summary.weeklyCapacity}{' '}
              {t('weeklySlots', { defaultValue: 'weekly slots' })}
            </span>
            <span className="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold bg-gray-100 text-gray-600">
              {t('openDays', { defaultValue: 'Open days' })}:{' '}
              {summary.openDays || t('none', { defaultValue: 'None' })}
            </span>
            {savedAt && (
              <span className="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold bg-gray-100 text-gray-600">
                {t('lastUpdated', { defaultValue: 'Last updated' })}:{' '}
                {new Intl.DateTimeFormat(intlLocale, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(savedAt))}
              </span>
            )}
          </div>
          {error && (
            <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[12.5px] text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="grid gap-3 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-3">
            <section className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
              <div className="mb-3">
                <h2 className="text-[13.5px] font-bold text-gray-900">
                  {t('smartPresets', { defaultValue: 'Smart presets' })}
                </h2>
                <p className="mt-1 text-[11px] text-gray-500">
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

            <section className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
              <div className="mb-3">
                <h2 className="text-[13.5px] font-bold text-gray-900">
                  {t('weeklySchedule', { defaultValue: 'Weekly schedule' })}
                </h2>
                <p className="mt-1 text-[11px] text-gray-500">
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

          <section className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
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
