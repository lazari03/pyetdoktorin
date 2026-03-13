'use client';

import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useManageAvailability } from '@/presentation/hooks/useManageAvailability';
import SmartAvailabilityPresets from '@/presentation/components/availability/SmartAvailabilityPresets';
import WeeklyScheduleEditor from '@/presentation/components/availability/WeeklyScheduleEditor';
import DateOverridesEditor from '@/presentation/components/availability/DateOverridesEditor';

export default function DoctorAvailabilityPage() {
  const { t } = useTranslation();
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

  if (loading || !availability) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-500 shadow-sm">
          {t('loadingAvailability') || 'Loading smart availability...'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
          <p className="text-sm font-medium text-teal-700">
            {t('availabilityEyebrow') || 'Smart availability'}
          </p>
          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                {t('manageAvailability') || 'Manage your smart availability'}
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {t('availabilityDescription') || 'Choose a preset, refine your weekly rhythm, and set one-off exceptions. Patients will only see times that fit your real working pattern.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (t('saving') || 'Saving...') : (t('saveAvailability') || 'Save availability')}
            </button>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="rounded-full bg-teal-50 px-4 py-2 font-medium text-teal-700">
              {summary.weeklyCapacity} {t('weeklySlots') || 'weekly slots'}
            </span>
            <span className="rounded-full bg-slate-100 px-4 py-2">
              {(t('openDays') || 'Open days')}: {summary.openDays || (t('none') || 'None')}
            </span>
            {savedAt && (
              <span className="rounded-full bg-slate-100 px-4 py-2">
                {(t('lastUpdated') || 'Last updated')}: {new Date(savedAt).toLocaleString()}
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
            <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  {t('smartPresets') || 'Smart presets'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t('smartPresetsHint') || 'Start from a clinically sensible template, then fine-tune it for your practice.'}
                </p>
              </div>
              <SmartAvailabilityPresets
                presets={presets}
                activePresetId={availability.presetId}
                onApply={applyPreset}
              />
            </section>

            <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  {t('weeklySchedule') || 'Weekly schedule'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t('weeklyScheduleHint') || 'Keep your weekly pattern simple and consistent. Smart slots are generated from these hours.'}
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

          <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
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
