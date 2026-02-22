"use client";

import { useMemo, useState } from "react";
import useNewAppointment from "@/presentation/hooks/useNewAppointment";
import { useNavigationCoordinator } from "@/navigation/NavigationCoordinator";

interface TimeSlot {
  time: string;
  disabled?: boolean;
}

interface SelectedDoctor {
  id: string;
  name: string;
  specialization: string;
}

/**
 * Parses a time string to minutes since midnight for comparison.
 * Supports formats: "09:00", "9:00", "9:00 AM", "12:30 pm"
 */
function parseTimeToMinutes(time: string): number | null {
  if (!time) return null;

  // Handle formats like "09:00", "9:00"
  const simpleMatch = time.match(/^(\d{1,2}):(\d{2})$/);
  if (simpleMatch) {
    const hours = parseInt(simpleMatch[1], 10);
    const minutes = parseInt(simpleMatch[2], 10);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
  }

  // Handle formats like "9:00 AM", "12:30 pm"
  const ampmMatch = time.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2], 10);
    const period = ampmMatch[3].toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  return null;
}

export interface NewAppointmentViewModelResult {
  // Doctor selection
  selectedDoctor: SelectedDoctor | null;
  handleDoctorSelect: (doctor: {
    id: string;
    name: string;
    specialization?: string | string[];
  }) => void;
  clearSelectedDoctor: () => void;

  // Appointment form fields
  appointmentType: string;
  setAppointmentType: (type: string) => void;
  preferredDate: string;
  setPreferredDate: (date: string) => void;
  preferredTime: string;
  setPreferredTime: (time: string) => void;
  notes: string;
  setNotes: (notes: string) => void;

  // Time slots (filtered for visibility)
  visibleTimeSlots: TimeSlot[];
  minDate: string;

  // Form state
  isSubmitting: boolean;
  canSubmit: boolean;
  submitError: string | null;
  clearSubmitError: () => void;

  // Actions
  handleFormSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;

  // Modal state
  showModal: boolean;
  handleCloseModal: () => void;

  // Summary helpers
  hasSummaryContent: boolean;
}

export function useNewAppointmentViewModel(): NewAppointmentViewModelResult {
  const {
    selectedDoctor,
    setSelectedDoctor,
    appointmentType,
    setAppointmentType,
    preferredDate,
    setPreferredDate,
    preferredTime,
    setPreferredTime,
    notes,
    setNotes,
    handleSubmit,
    isSubmitting,
    submitError,
    clearSubmitError,
    availableTimes,
  } = useNewAppointment();

  const nav = useNavigationCoordinator();
  const [showModal, setShowModal] = useState(false);

  // Check if selected date is today
  const isToday = useMemo(() => {
    if (!preferredDate) return false;
    const today = new Date();
    const [year, month, day] = preferredDate.split("-").map(Number);
    if (!year || !month || !day) return false;
    return (
      today.getFullYear() === year &&
      today.getMonth() + 1 === month &&
      today.getDate() === day
    );
  }, [preferredDate]);

  // Current time in minutes for filtering past slots
  const currentMinutes = useMemo(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }, []);

  // Filter available time slots: hide disabled and past times if today
  const visibleTimeSlots = useMemo((): TimeSlot[] => {
    if (!Array.isArray(availableTimes)) return [];

    return availableTimes.filter((slot: TimeSlot) => {
      if (slot.disabled) return false;
      if (!isToday) return true;
      const mins = parseTimeToMinutes(slot.time);
      if (mins === null) return true; // if we can't parse, keep it
      return mins > currentMinutes;
    });
  }, [availableTimes, isToday, currentMinutes]);

  // Min date for date picker (today)
  const minDate = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  // Handle doctor selection with specialization normalization
  const handleDoctorSelect = (doctor: {
    id: string;
    name: string;
    specialization?: string | string[];
  }) => {
    setSelectedDoctor({
      ...doctor,
      specialization: Array.isArray(doctor.specialization)
        ? doctor.specialization.join(", ")
        : doctor.specialization || "General",
    });
  };
  const clearSelectedDoctor = () => {
    setSelectedDoctor(null);
  };

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSubmit(e, setShowModal, () => {});
  };

  // Handle modal close with navigation
  const handleCloseModal = () => {
    nav.toAppointments();
  };

  // Check if form can be submitted
  const canSubmit = useMemo(() => {
    return !!(
      !isSubmitting &&
      selectedDoctor &&
      preferredDate &&
      preferredTime &&
      appointmentType
    );
  }, [isSubmitting, selectedDoctor, preferredDate, preferredTime, appointmentType]);

  // Check if summary has any content to display
  const hasSummaryContent = useMemo(() => {
    return !!(selectedDoctor || preferredDate || preferredTime || appointmentType);
  }, [selectedDoctor, preferredDate, preferredTime, appointmentType]);

  return {
    // Doctor
    selectedDoctor: selectedDoctor as SelectedDoctor | null,
    handleDoctorSelect,
    clearSelectedDoctor,

    // Form fields
    appointmentType,
    setAppointmentType,
    preferredDate,
    setPreferredDate,
    preferredTime,
    setPreferredTime,
    notes,
    setNotes,

    // Time slots
    visibleTimeSlots,
    minDate,

    // Form state
    isSubmitting,
    canSubmit,
    submitError,
    clearSubmitError,

    // Actions
    handleFormSubmit,

    // Modal
    showModal,
    handleCloseModal,

    // Summary
    hasSummaryContent,
  };
}
