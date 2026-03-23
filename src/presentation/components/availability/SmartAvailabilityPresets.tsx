'use client';

import type { AvailabilityPresetId } from '@/domain/entities/DoctorAvailability';

type Preset = {
  id: AvailabilityPresetId;
  label: string;
  description: string;
};

type Props = {
  activePresetId: AvailabilityPresetId;
  presets: Preset[];
  onApply: (presetId: AvailabilityPresetId) => void;
};

export default function SmartAvailabilityPresets({ activePresetId, presets, onApply }: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {presets.map((preset) => {
        const active = preset.id === activePresetId;
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onApply(preset.id)}
            className={`rounded-3xl border p-4 text-left transition ${
              active
                ? 'border-purple-300 bg-purple-50 shadow-[0_14px_30px_-22px_rgba(139,92,246,0.85)]'
                : 'border-slate-200 bg-slate-50 hover:border-purple-200 hover:bg-white'
            }`}
          >
            <p className="text-sm font-semibold text-slate-900">{preset.label}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{preset.description}</p>
          </button>
        );
      })}
    </div>
  );
}
