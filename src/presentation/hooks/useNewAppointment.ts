
import { useState, useEffect } from 'react';
import { useNewAppointmentStore } from '@/store/newAppointmentStore';
import { Appointment } from '@/domain/entities/Appointment';
import { AppointmentStatus } from '@/domain/entities/AppointmentStatus';
import { useAuth } from '@/context/AuthContext';
import { createAppointment } from '@/network/appointments';
import { addMinutes, format, isSameDay, isBefore, startOfDay } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { trackAnalyticsEvent } from '@/presentation/utils/trackAnalyticsEvent';

export default function useNewAppointment() {
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
    resetAppointment,
  } = useNewAppointmentStore();

  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<{ time: string; disabled: boolean }[]>();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.name) {
      setPatientName(user.name);
    }
  }, [user?.name]);

  useEffect(() => {
    if (preferredDate) {
      const now = new Date();
      const selectedDate = startOfDay(new Date(preferredDate));
      const times: { time: string; disabled: boolean }[] = [];

      for (let minutes = 0; minutes < 24 * 60; minutes += 30) {
        const time = addMinutes(selectedDate, minutes);
        const formattedTime = format(time, 'hh:mm a');
        const isDisabled = isSameDay(time, now) && isBefore(time, now);

        times.push({
          time: formattedTime,
          disabled: isDisabled,
        });
      }

      setAvailableTimes(times);
    } else {
      setAvailableTimes([]);
    }
  }, [preferredDate]);

  const handleSubmit = async (
    e: React.FormEvent,
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
    setProgress: React.Dispatch<React.SetStateAction<number>>
  ) => {
    e.preventDefault();

    setSubmitError(null);

    if (isSubmitting) {
      return;
    }

    if (!selectedDoctor) {
      trackAnalyticsEvent('appointment_booking_failed', { reason: 'missing_doctor' });
      setSubmitError(t('selectDoctorError') || 'Please select a doctor before continuing.');
      return;
    }

    if (!user || !user.uid || !user.name) {
      trackAnalyticsEvent('appointment_booking_failed', { reason: 'unauthenticated' });
      setSubmitError(t('signInToBookError') || 'Please sign in to book an appointment.');
      return;
    }

    setIsSubmitting(true);
    trackAnalyticsEvent('appointment_booking_attempt', {
      doctorId: selectedDoctor.id,
      appointmentType,
      preferredDate,
      preferredTime,
    });
    const appointmentData: Omit<Appointment, 'id'> = {
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      patientId: user.uid,
      patientName: user.name,
      appointmentType,
      preferredDate,
      preferredTime,
      notes,
      isPaid: false,
      createdAt: new Date().toISOString(),
      status: AppointmentStatus.Pending,
    };
    try {
      await createAppointment({
        doctorId: appointmentData.doctorId,
        doctorName: appointmentData.doctorName,
        appointmentType,
        preferredDate: appointmentData.preferredDate!,
        preferredTime: appointmentData.preferredTime,
        note: notes,
      });
      trackAnalyticsEvent('appointment_booking_success', {
        doctorId: appointmentData.doctorId,
        appointmentType,
        preferredDate,
        preferredTime,
      });
      resetAppointment();
      setShowModal(true);
      let progressValue = 100;
      const interval = setInterval(() => {
        progressValue -= 10;
      setProgress(progressValue);
        if (progressValue <= 0) {
          clearInterval(interval);
        }
      }, 300);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      trackAnalyticsEvent('appointment_booking_failed', {
        doctorId: selectedDoctor.id,
        appointmentType,
        preferredDate,
        preferredTime,
        reason: message ? message.slice(0, 120) : 'unknown_error',
      });
      setSubmitError(message || (t('appointmentBookingFailed') || 'Failed to book appointment.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
    resetAppointment,
    handleSubmit,
    isSubmitting,
    loading, // Return loading
    submitError,
    clearSubmitError: () => setSubmitError(null),
    patientName,
    availableTimes,
  };
}
