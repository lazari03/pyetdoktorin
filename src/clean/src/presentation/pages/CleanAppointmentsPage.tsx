import React from 'react';
import { CleanArchitectureLayout } from '../presentation/layout/CleanArchitectureLayout';
import { AppointmentList } from '../presentation/components/AppointmentList';
import { NotificationCenter } from '../presentation/components/NotificationCenter';
import { useUserAppointments } from '../presentation/hooks/useUserAppointments';
import { useNotifications } from '../presentation/hooks/useNotifications';
import { useGetUserAppointmentsUseCase } from '../infrastructure/di/DependencyContext';
import { useCreateNotificationUseCase } from '../infrastructure/di/DependencyContext';
import { useUpdateAppointmentStatusUseCase } from '../infrastructure/di/DependencyContext';

// Mock user ID - in real app, this would come from auth context
const CURRENT_USER_ID = 'mock-user-id';
const IS_DOCTOR = false;

export const CleanAppointmentsPage: React.FC = () => {
  const getUserAppointmentsUseCase = useGetUserAppointmentsUseCase();
  const createNotificationUseCase = useCreateNotificationUseCase();
  const updateAppointmentStatusUseCase = useUpdateAppointmentStatusUseCase();

  const {
    appointments,
    loading: appointmentsLoading,
    error: appointmentsError,
    refreshAppointments
  } = useUserAppointments({
    userId: CURRENT_USER_ID,
    isDoctor: IS_DOCTOR,
    getUserAppointmentsUseCase
  });

  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    dismissAll
  } = useNotifications({
    userId: CURRENT_USER_ID,
    createNotificationUseCase
  });

  const handlePayAppointment = (appointmentId: string) => {
    console.log('Payment initiated for appointment:', appointmentId);
    // In real app, this would open payment modal or redirect to payment page
  };

  return (
    <CleanArchitectureLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {IS_DOCTOR ? 'Doctor Dashboard' : 'My Appointments'}
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your appointments and stay updated with notifications
            </p>
          </div>

          {appointmentsError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-800">
                <strong>Error:</strong> {appointmentsError}
                <button
                  onClick={refreshAppointments}
                  className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content - Appointments */}
            <div className="lg:col-span-2">
              <AppointmentList
                userId={CURRENT_USER_ID}
                isDoctor={IS_DOCTOR}
                getUserAppointmentsUseCase={getUserAppointmentsUseCase}
                updateAppointmentStatusUseCase={updateAppointmentStatusUseCase}
                onPayAppointment={handlePayAppointment}
              />
            </div>

            {/* Sidebar - Notifications */}
            <div className="lg:col-span-1">
              <NotificationCenter
                notifications={notifications}
                unreadCount={unreadCount}
                loading={notificationsLoading}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onDismissNotification={dismissNotification}
                onDismissAll={dismissAll}
              />
            </div>
          </div>
        </div>
      </div>
    </CleanArchitectureLayout>
  );
};