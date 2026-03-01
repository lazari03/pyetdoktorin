"use client";

import { useEffect, useState } from "react";
import { useNavigationCoordinator } from "@/navigation/NavigationCoordinator";
import { UserRole } from "@/domain/entities/UserRole";
import { getRoleLandingPath } from "@/navigation/roleRoutes";

type Params = {
  loading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  pathname: string | null;
  allowedRole: UserRole;
};

export function useSectionGuard({ loading, isAuthenticated, role, pathname, allowedRole }: Params) {
  const nav = useNavigationCoordinator();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      setRedirecting(true);
      nav.toLogin(pathname ?? undefined);
      return;
    }

    if (role && role !== allowedRole) {
      setRedirecting(true);
      nav.replacePath(getRoleLandingPath(role));
      return;
    }

    setRedirecting(false);
  }, [allowedRole, isAuthenticated, loading, nav, pathname, role]);

  return { redirecting };
}

