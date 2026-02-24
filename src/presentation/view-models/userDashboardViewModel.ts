"use client";

import { useEffect, useMemo, useState } from "react";
import {
    useDashboardStore,
    AppointmentFilter,
} from "@/store/dashboardStore";
import { useAppointmentStore } from "@/store/appointmentStore";
import { isProfileIncomplete } from "@/store/generalStore";
import { useDashboardActions } from "@/presentation/hooks/useDashboardActions";
import { UserRole } from "@/domain/entities/UserRole";
import { useDI } from "@/context/DIContext";

export type DashboardUserContext = {
  userId: string | null;
  role: UserRole | null;
  authLoading: boolean;
};

export function useDashboardViewModel(auth: DashboardUserContext) {
  const { userId, role, authLoading } = auth;
    const {
        totalAppointments,
        fetchAppointments,
        activeFilter,
        setActiveFilter,
        showRedirecting,
        setShowRedirecting,
    } = useDashboardStore();
    const {
        appointments,
        isAppointmentPast,
        fetchAppointments: fetchAllAppointments,
        subscribeAppointments,
    } = useAppointmentStore();
    const { handleJoinCall: baseHandleJoinCall, handlePayNow } =
        useDashboardActions();
    const { checkProfileCompleteUseCase } = useDI();

    const [profileIncomplete, setProfileIncomplete] = useState(true);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const fetchAll = async () => {
      try {
        if (userId && role) {
          setProfileIncomplete(
            await isProfileIncomplete(
              role,
              userId,
              checkProfileCompleteUseCase
            )
          );
          await Promise.all([
            fetchAppointments(role),
            fetchAllAppointments(role),
          ]);
        }
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) {
      fetchAll();
      timeout = setTimeout(() => setLoading(false), 5000);
    }
    return () => timeout && clearTimeout(timeout);
  }, [
    userId,
    role,
    fetchAppointments,
    fetchAllAppointments,
    authLoading,
    checkProfileCompleteUseCase,
  ]);

  useEffect(() => {
    if (!role || !userId) return;
    const unsubscribe = subscribeAppointments(userId, role);
    return () => unsubscribe();
  }, [role, subscribeAppointments, userId]);

  const filteredAppointments = useMemo(() => {
  if (!appointments) return [];

  switch (activeFilter) {
    case AppointmentFilter.Unpaid:
      return appointments.filter(
        (a) => a.isPaid === false || a.status === "pending"
      );
    case AppointmentFilter.Past:
      return appointments.filter((a) => isAppointmentPast(a));
    case AppointmentFilter.All:
    default:
      return appointments;
  }
}, [appointments, activeFilter, isAppointmentPast]);
    
  return {
    userId,
    role,
    authLoading,
    totalAppointments,
    appointments,
    activeFilter,
    setActiveFilter,
    showRedirecting,
    setShowRedirecting,
    isAppointmentPast,
    handlePayNow,
    baseHandleJoinCall,
    profileIncomplete,
    setProfileIncomplete,
    loading,
    setLoading,
    fetchAppointments,
    fetchAllAppointments,
    filteredAppointments,
  };

}
