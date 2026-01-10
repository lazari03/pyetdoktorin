"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
    useDashboardStore,
    AppointmentFilter,
} from "@/store/dashboardStore";
import { useAppointmentStore } from "@/store/appointmentStore";
import { isProfileIncomplete } from "@/store/generalStore";
import { CheckProfileCompleteUseCase } from "@/application/checkProfileCompleteUseCase";
import { FetchAppointmentsUseCase } from "@/application/fetchAppointmentsUseCase";
import { userRepository } from "@/infrastructure/userRepository";
import { appointmentRepository } from "@/infrastructure/appointmentRepository";
import { useDashboardActions } from "@/hooks/useDashboardActions";
import { UserRole } from "@/domain/entities/UserRole";
import { filter } from "lodash";

export function useDashboardViewModel() {
    const { user, role, loading: authLoading } = useAuth();
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
    } = useAppointmentStore();
    const { handleJoinCall: baseHandleJoinCall, handlePayNow } =
        useDashboardActions();

    const [profileIncomplete, setProfileIncomplete] = useState(true);
    const [loading, setLoading] = useState(true);

    const checkProfileUseCase = useMemo(
    () => new CheckProfileCompleteUseCase(userRepository),
    []
  );
  const fetchAppointmentsUseCase = useMemo(
    () => new FetchAppointmentsUseCase(appointmentRepository),
    []
  );

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const fetchAll = async () => {
      try {
        if (user && role) {
          setProfileIncomplete(
            await isProfileIncomplete(
              role,
              user.uid,
              checkProfileUseCase
            )
          );
          await Promise.all([
            fetchAppointments(
              user.uid,
              role,
              fetchAppointmentsUseCase.execute.bind(fetchAppointmentsUseCase)
            ),
            fetchAllAppointments(
              user.uid,
              role === UserRole.Doctor,
              fetchAppointmentsUseCase.execute.bind(fetchAppointmentsUseCase)
            ),
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
    user,
    role,
    fetchAppointments,
    fetchAllAppointments,
    authLoading,
    checkProfileUseCase,
    fetchAppointmentsUseCase,
  ]);

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
    user,
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