import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useDI } from "@/context/DIContext";
import { useCurrentUserProfile } from "@/presentation/hooks/useCurrentUserProfile";

const addMonths = (dateString: string, months: number) => {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return null;
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
};

export function useCheckupReminder() {
  const { user } = useAuth();
  const { updateUserProfileUseCase } = useDI();
  // Shares the same cache entry as AuthContext/useMyProfile, so a checkup-date
  // save here is immediately reflected everywhere else that reads the profile.
  const { data: profile, isLoading: loading, mutate } = useCurrentUserProfile(user?.uid ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastCheckupDate = profile?.lastCheckupDate ?? "";

  const nextCheckupDue = useMemo(() => {
    if (!lastCheckupDate) return null;
    return addMonths(lastCheckupDate, 6);
  }, [lastCheckupDate]);

  const saveDate = async (date: string) => {
    if (!user?.uid) return;
    setSaving(true);
    setError(null);
    try {
      const next = addMonths(date, 6);
      await updateUserProfileUseCase.execute(user.uid, {
        lastCheckupDate: date,
        nextCheckupDueDate: next ?? undefined,
      });
      await mutate();
    } catch (e) {
      console.error(e);
      setError("Failed to save date. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    error,
    lastCheckupDate,
    nextCheckupDue,
    saveDate,
  };
}
