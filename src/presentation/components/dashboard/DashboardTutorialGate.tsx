'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDI } from '@/context/DIContext';
import { DashboardTutorialModal } from '@/presentation/components/dashboard/DashboardTutorialModal';
import { UserRole } from '@/domain/entities/UserRole';
import type { UserProfileData } from '@/application/ports/IUserProfileService';

const DASHBOARD_TUTORIAL_VERSION = 1;

type Props = {
  userId: string;
  role: UserRole;
};

function hasSeenTutorial(profile: UserProfileData | null): boolean {
  if (!profile) return false;
  if (profile.dashboardTutorialSeen) return true;
  if ((profile.dashboardTutorialVersion ?? 0) >= DASHBOARD_TUTORIAL_VERSION) return true;
  return false;
}

export function DashboardTutorialGate({ userId, role }: Props) {
  const { getUserProfileUseCase, updateUserProfileUseCase } = useDI();
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  const shouldRun = useMemo(() => Boolean(userId && role), [role, userId]);

  useEffect(() => {
    if (!shouldRun) return;
    let active = true;
    (async () => {
      try {
        const profile = await getUserProfileUseCase.execute(userId);
        if (!active) return;
        setOpen(!hasSeenTutorial(profile));
      } catch {
        if (!active) return;
        setOpen(false);
      } finally {
        if (active) setChecked(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [getUserProfileUseCase, shouldRun, userId]);

  const complete = async () => {
    setOpen(false);
    try {
      await updateUserProfileUseCase.execute(userId, {
        dashboardTutorialSeen: true,
        dashboardTutorialVersion: DASHBOARD_TUTORIAL_VERSION,
        dashboardTutorialSeenAt: new Date().toISOString(),
      });
    } catch (err) {
      // Best-effort: avoid blocking the user.
      console.warn('Failed to persist tutorial flag', err);
    }
  };

  if (!checked) return null;

  return (
    <DashboardTutorialModal
      isOpen={open}
      role={role}
      onClose={() => {
        void complete();
      }}
      onComplete={() => {
        void complete();
      }}
    />
  );
}
