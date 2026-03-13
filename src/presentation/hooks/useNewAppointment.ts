
import { useState, useEffect } from 'react';
import { useNewAppointmentStore } from '@/store/newAppointmentStore';
import { Appointment } from '@/domain/entities/Appointment';
import { AppointmentStatus } from '@/domain/entities/AppointmentStatus';
import { useAuth } from '@/context/AuthContext';
import { createAppointment } from '@/network/appointments';
import { addMinutes, format, isSameDay, isBefore, startOfDay } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { trackAnalyticsEvent } from '@/presentation/utils/trackAnalyticsEvent';
import { getAppointmentErrorMessage } from '@/presentation/utils/errorMessages';
import { notifyFormSubmission } from '@/presentation/utils/formNotifications';
import { getResolvedAvailabilitySlots } from '@/network/availability';

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
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.name) {
      setPatientName(user.name);
    }
  }, [user?.name]);

  useEffect(() => {
    let active = true;

    const buildFallbackTimes = () => {
      if (!preferredDate) {
        setAvailableTimes([]);
        return;
      }

      const now = new Date();
      const selectedDate = startOfDay(new Date(preferredDate));
      const times: { time: string; disabled: boolean }[] = [];

      for (let minutes = 9 * 60; minutes < 17 * 60; minutes += 30) {
        const time = addMinutes(selectedDate, minutes);
        const formattedTime = format(time, 'hh:mm a');
        const isDisabled = isSameDay(time, now) && isBefore(time, now);
        times.push({
          time: formattedTime,
          disabled: isDisabled,
        });
      }

      setAvailableTimes(times);
    };

    const loadAvailability = async () => {
      if (!preferredDate || !selectedDoctor?.id) {
        setAvailableTimes([]);
        return;
      }

      setAvailabilityLoading(true);
      try {
        const slots = await getResolvedAvailabilitySlots(selectedDoctor.id, preferredDate);
        if (!active) return;
        setAvailableTimes(
          slots.map((slot) => ({
            time: format(new Date(`2000-01-01T${slot.time}:00`), 'hh:mm a'),
            disabled: slot.booked || slot.past,
          })),
        );
      } catch {
        if (!active) return;
        buildFallbackTimes();
      } finally {
        if (active) setAvailabilityLoading(false);
      }
    };

    void loadAvailability();

    return () => {
      active = false;
    };
  }, [preferredDate, selectedDoctor?.id]);

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
      setSubmitError(t('selectDoctorError'));
      return;
    }

    if (!user || !user.uid || !user.name) {
      trackAnalyticsEvent('appointment_booking_failed', { reason: 'unauthenticated' });
      setSubmitError(t('signInToBookError'));
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
      void notifyFormSubmission({
        formType: 'appointment_request',
        source: 'new_appointment',
        subject: `Appointment request: ${appointmentData.doctorName}`,
        replyTo: user.email || undefined,
        data: {
          doctorId: appointmentData.doctorId,
          doctorName: appointmentData.doctorName,
          patientId: appointmentData.patientId,
          patientName: appointmentData.patientName,
          patientEmail: user.email || '',
          appointmentType,
          preferredDate: appointmentData.preferredDate || '',
          preferredTime: appointmentData.preferredTime,
          notes,
        },
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
      const translatedMessage = getAppointmentErrorMessage(error, t);
      const message = translatedMessage ?? (error instanceof Error ? error.message : '');
      trackAnalyticsEvent('appointment_booking_failed', {
        doctorId: selectedDoctor.id,
        appointmentType,
        preferredDate,
        preferredTime,
        reason: message ? message.slice(0, 120) : 'unknown_error',
      });
      setSubmitError(message || t('appointmentBookingFailed'));
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
    availabilityLoading,
  };
}
