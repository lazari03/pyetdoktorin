'use client';

import { useTranslation } from 'react-i18next';
import { getPasswordStrength } from '@/presentation/utils/passwordStrength';

const BAR_COLORS = ['bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-500'];
const LABEL_COLORS = ['text-red-600', 'text-orange-600', 'text-amber-600', 'text-emerald-600'];

export function PasswordStrengthMeter({ password }: { password: string }) {
  const { t } = useTranslation();
  if (!password) return null;

  const { score, labelKey } = getPasswordStrength(password);
  const colorIndex = Math.max(0, score - 1);

  return (
    <div className="mt-1.5" aria-live="polite">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < score ? BAR_COLORS[colorIndex] : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className={`mt-1 text-[11px] font-medium ${LABEL_COLORS[colorIndex]}`}>
        {t(labelKey)}
      </p>
    </div>
  );
}
