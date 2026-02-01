import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useDI } from "@/context/DIContext";

const addMonths = (dateString: string, months: number) => {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return null;
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
};

export function useCheckupReminder() {
  const { user } = useAuth();
  const { getUserProfileUseCase, updateUserProfileUseCase } = useDI();
  const [lastCheckupDate, setLastCheckupDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      try {
        const profile = await getUserProfileUseCase.execute(user.uid);
        if (profile?.lastCheckupDate) setLastCheckupDate(profile.lastCheckupDate);
      } catch (e) {
        console.error(e);
        setError("Failed to load check-up reminder.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, getUserProfileUseCase]);

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
      setLastCheckupDate(date);
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
    setLastCheckupDate,
    nextCheckupDue,
    saveDate,
  };
}
