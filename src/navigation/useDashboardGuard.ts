"use client";

import { useEffect, useState } from "react";
import { useNavigationCoordinator } from "@/navigation/NavigationCoordinator";
import { ROUTES } from "@/config/routes";
import { UserRole } from "@/domain/entities/UserRole";
import { getRoleLandingPath } from "@/navigation/roleRoutes";

type Params = {
  loading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  pathname: string | null;
};

export function useDashboardGuard({ loading, isAuthenticated, role, pathname }: Params) {
  const nav = useNavigationCoordinator();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      setRedirecting(true);
      nav.toLogin(pathname ?? undefined);
      return;
    }

    // If the user is authenticated but their role belongs to another section,
    // redirect to the correct landing route (no raw path strings in UI files).
    if (role) {
      const landing = getRoleLandingPath(role);
      if (pathname?.startsWith(ROUTES.DASHBOARD) && landing !== ROUTES.DASHBOARD) {
        setRedirecting(true);
        nav.replacePath(landing);
        return;
      }
    }

    setRedirecting(false);
  }, [loading, isAuthenticated, nav, pathname, role]);

  return { redirecting };
}

